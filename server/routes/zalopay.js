/**
 * ZaloPay Routes — Thanh toán 2 lần (Cọc 50% + Thanh toán nốt 50%)
 * =================================================================
 * POST /api/zalopay/create-deposit       — Tạo đơn ZaloPay cọc 50%
 * POST /api/zalopay/create-final-payment — Tạo đơn ZaloPay thanh toán nốt 50%
 * POST /api/zalopay/callback             — ZaloPay gọi về (phân biệt deposit vs final)
 * POST /api/zalopay/query                — Query trạng thái giao dịch
 *
 * [GIỮ NGUYÊN] create-order cũ vẫn còn để không break nếu có đoạn nào gọi
 */

const router = require("express").Router();
const axios = require("axios");
const crypto = require("crypto");
const { verifyToken } = require("../middleware/authMiddleware");
const CustomOrder = require("../models/CustomOrder");
const MakerProfile = require("../models/MakerProfile");
const CommissionDebt = require("../models/CommissionDebt");
const MakerPayout = require("../models/MakerPayout");
const { MAKER_BADGE } = require("../constants/business");
const sequelize = require("../config/db");
const mailer = require("../utils/mailer");
const User = require("../models/User");

const ZALOPAY = {
  app_id: parseInt(process.env.ZALOPAY_APP_ID),
  key1: process.env.ZALOPAY_MAC_KEY,
  key2: process.env.ZALOPAY_REFUND_KEY,
  endpoint_create: "https://sb-openapi.zalopay.vn/v2/create",
  endpoint_query: "https://sb-openapi.zalopay.vn/v2/query",
};

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const genTransId = (orderId, suffix = "") => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `${yy}${mm}${dd}_pinky${orderId}${suffix}_${rand}`;
};

const hmac256 = (data, key) =>
  crypto.createHmac("sha256", key).update(data).digest("hex");

// Helper: tạo payload ZaloPay + gọi API
const createZaloPayOrder = async ({
  userId,
  orderId,
  amount,
  description,
  transId,
  type,
}) => {
  const appTime = Date.now();

  const embedData = JSON.stringify({
    customOrderId: orderId,
    paymentType: type, // "deposit" | "final"
    redirecturl: `${CLIENT_URL}/custom-order/${orderId}?zpstatus=1&type=${type}`,
  });

  const items = JSON.stringify([
    {
      itemid: `custom_order_${orderId}_${type}`,
      itemname: description,
      itemprice: amount,
      itemquantity: 1,
    },
  ]);

  const macData = [
    ZALOPAY.app_id,
    transId,
    `user_${userId}`,
    amount,
    appTime,
    embedData,
    items,
  ].join("|");

  const mac = hmac256(macData, ZALOPAY.key1);

  const payload = {
    app_id: ZALOPAY.app_id,
    app_user: `user_${userId}`,
    app_trans_id: transId,
    app_time: appTime,
    amount,
    item: items,
    description: `PinkyCrafts - ${description}`,
    embed_data: embedData,
    callback_url: `${process.env.SERVER_URL || "http://localhost:5000"}/api/zalopay/callback`,
    bank_code: "",
    mac,
  };

  const zpRes = await axios.post(ZALOPAY.endpoint_create, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return zpRes.data;
};

//  Helper: xử lý hoàn thành đơn sau khi final payment xong
const _finalizeOrder = async (order, t) => {
  order.paymentStatus = "paid";
  order.status = "Hoàn thành";
  await order.save({ transaction: t });

  const makerProfile = await MakerProfile.findOne({
    where: { userId: order.makerId },
    transaction: t,
  });

  if (!makerProfile) return;

  makerProfile.totalDone += 1;
  makerProfile.totalEarning += order.makerEarning || 0;

  const tier = MAKER_BADGE.calculate(
    makerProfile.totalDone,
    makerProfile.rating,
  );
  makerProfile.badge = tier.label;
  makerProfile.badgeEmoji = tier.emoji;
  await makerProfile.save({ transaction: t });

  // CommissionDebt — idempotent
  const existingDebt = await CommissionDebt.findOne({
    where: { customOrderId: order.id },
    transaction: t,
  });
  if (!existingDebt) {
    await CommissionDebt.create(
      {
        makerId: makerProfile.id,
        customOrderId: order.id,
        amount: order.shopEarning || 0,
        agreedPrice: order.agreedPrice,
        commissionRate: order.commissionRate,
        status: "chua_thu",
      },
      { transaction: t },
    );
  }

  // MakerPayout — idempotent
  const existingPayout = await MakerPayout.findOne({
    where: { customOrderId: order.id },
    transaction: t,
  });
  if (!existingPayout) {
    await MakerPayout.create(
      {
        makerId: makerProfile.id,
        customOrderId: order.id,
        amount: order.makerEarning || 0,
        agreedPrice: order.agreedPrice,
        commissionRate: order.commissionRate,
        status: "cho_tra",
        note: "Tạo tự động qua ZaloPay",
      },
      { transaction: t },
    );
  }
};

//  POST /api/zalopay/create-deposit  — Tạo đơn cọc 50%
router.post("/create-deposit", verifyToken, async (req, res) => {
  try {
    const { customOrderId } = req.body;

    const order = await CustomOrder.findByPk(customOrderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn gia công" });
    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });
    if (order.status !== "Đã chọn thợ")
      return res
        .status(400)
        .json({ message: "Đơn phải ở trạng thái 'Đã chọn thợ' để cọc!" });
    if (order.depositStatus === "paid")
      return res.status(400).json({ message: "Đơn này đã được cọc rồi!" });

    const depositAmount =
      order.depositAmount || Math.round(order.agreedPrice * 0.5);
    const transId = genTransId(order.id, "d");

    const zpData = await createZaloPayOrder({
      userId: req.user.id,
      orderId: order.id,
      amount: depositAmount,
      description: `Cọc 50% gia công: ${order.title}`,
      transId,
      type: "deposit",
    });

    if (zpData.return_code !== 1) {
      console.error("[ZaloPay create-deposit] Error:", zpData);
      return res.status(502).json({
        message: "ZaloPay từ chối tạo đơn: " + zpData.return_message,
        zpData,
      });
    }

    order.depositTransId = transId;
    await order.save();

    res.json({
      order_url: zpData.order_url,
      zp_trans_token: zpData.zp_trans_token,
      app_trans_id: transId,
      depositAmount,
    });
  } catch (err) {
    console.error("[ZaloPay POST /create-deposit]", err.message);
    res
      .status(500)
      .json({ message: "Lỗi tạo đơn cọc ZaloPay", error: err.message });
  }
});

//  POST /api/zalopay/create-final-payment  — Tạo đơn thanh toán nốt 50%
router.post("/create-final-payment", verifyToken, async (req, res) => {
  try {
    const { customOrderId } = req.body;

    const order = await CustomOrder.findByPk(customOrderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn gia công" });
    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });
    if (order.status !== "Chờ xác nhận")
      return res.status(400).json({
        message: "Đơn phải ở trạng thái 'Chờ xác nhận' để thanh toán nốt!",
      });
    if (order.depositStatus !== "paid")
      return res.status(400).json({ message: "Bạn chưa thanh toán cọc!" });
    if (order.finalStatus === "paid")
      return res
        .status(400)
        .json({ message: "Đơn này đã được thanh toán nốt rồi!" });

    const finalAmount =
      order.finalAmount ||
      order.agreedPrice -
        (order.depositAmount || Math.round(order.agreedPrice * 0.5));
    const transId = genTransId(order.id, "f");

    const zpData = await createZaloPayOrder({
      userId: req.user.id,
      orderId: order.id,
      amount: finalAmount,
      description: `Thanh toán nốt 50% gia công: ${order.title}`,
      transId,
      type: "final",
    });

    if (zpData.return_code !== 1) {
      console.error("[ZaloPay create-final-payment] Error:", zpData);
      return res.status(502).json({
        message: "ZaloPay từ chối tạo đơn: " + zpData.return_message,
        zpData,
      });
    }

    order.finalTransId = transId;
    await order.save();

    res.json({
      order_url: zpData.order_url,
      zp_trans_token: zpData.zp_trans_token,
      app_trans_id: transId,
      finalAmount,
    });
  } catch (err) {
    console.error("[ZaloPay POST /create-final-payment]", err.message);
    res
      .status(500)
      .json({ message: "Lỗi tạo đơn thanh toán ZaloPay", error: err.message });
  }
});

//  POST /api/zalopay/callback  — ZaloPay gọi về
//  Phân biệt deposit vs final qua depositTransId / finalTransId
router.post("/callback", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { data: cbData, mac: cbMac } = req.body;

    // 1. Verify MAC
    const expectedMac = hmac256(cbData, ZALOPAY.key2);
    if (cbMac !== expectedMac) {
      await t.rollback();
      console.warn("[ZaloPay callback] MAC mismatch!");
      return res.json({ return_code: -1, return_message: "MAC không hợp lệ" });
    }

    const parsed = JSON.parse(cbData);
    const { app_trans_id, app_time } = parsed;

    // 2. Xác định loại giao dịch: deposit hay final
    let order = await CustomOrder.findOne({
      where: { depositTransId: app_trans_id },
      transaction: t,
    });
    let paymentType = "deposit";

    if (!order) {
      order = await CustomOrder.findOne({
        where: { finalTransId: app_trans_id },
        transaction: t,
      });
      paymentType = "final";
    }

    // Fallback: tìm theo zpTransId cũ (backward compat)
    if (!order) {
      order = await CustomOrder.findOne({
        where: { zpTransId: app_trans_id },
        transaction: t,
      });
      paymentType = "legacy";
    }

    if (!order) {
      await t.rollback();
      console.warn(
        "[ZaloPay callback] Order not found for trans:",
        app_trans_id,
      );
      return res.json({ return_code: 1, return_message: "ok" });
    }

    //  DEPOSIT callback
    if (paymentType === "deposit") {
      // Idempotency
      if (order.depositStatus === "paid") {
        await t.rollback();
        return res.json({
          return_code: 1,
          return_message: "already processed",
        });
      }

      order.depositStatus = "paid";
      order.depositPaidAt = new Date(app_time);
      await order.save({ transaction: t });

      await t.commit();

      console.log(
        `[ZaloPay callback] ✅ DEPOSIT paid. Order ${order.id}. Trans: ${app_trans_id}`,
      );

      // Thông báo thợ đã có cọc → có thể bắt đầu
      try {
        const makerUser = await User.findByPk(order.makerId, {
          attributes: ["name", "email"],
        });
        const customer = await User.findByPk(order.userId, {
          attributes: ["name"],
        });
        if (makerUser?.email) {
          mailer.notifyDepositPaidToMaker({
            to: makerUser.email,
            makerName: makerUser.name,
            customerName: customer?.name,
            orderTitle: order.title,
            depositAmount: order.depositAmount,
            orderUrl: `${CLIENT_URL}/custom-order/${order.id}`,
          });
        }
      } catch (mailErr) {
        console.error(
          "[ZaloPay callback deposit] Email error:",
          mailErr.message,
        );
      }

      return res.json({ return_code: 1, return_message: "success" });
    }

    //  FINAL PAYMENT callback
    if (paymentType === "final") {
      if (order.finalStatus === "paid") {
        await t.rollback();
        return res.json({
          return_code: 1,
          return_message: "already processed",
        });
      }

      order.finalStatus = "paid";
      order.finalPaidAt = new Date(app_time);

      // Finalize: đổi trạng thái + tạo CommissionDebt + MakerPayout
      await _finalizeOrder(order, t);

      await t.commit();

      console.log(
        `[ZaloPay callback] ✅ FINAL PAYMENT paid. Order ${order.id} → Hoàn thành. Trans: ${app_trans_id}`,
      );

      // Email thợ
      try {
        const makerUser = await User.findByPk(order.makerId, {
          attributes: ["name", "email"],
        });
        const customer = await User.findByPk(order.userId, {
          attributes: ["name"],
        });
        if (makerUser?.email) {
          mailer.notifyOrderPaidToMaker({
            to: makerUser.email,
            makerName: makerUser.name,
            customerName: customer?.name,
            orderTitle: order.title,
            makerEarning: order.makerEarning,
            orderUrl: `${CLIENT_URL}/custom-order/${order.id}`,
          });
        }
      } catch (mailErr) {
        console.error("[ZaloPay callback final] Email error:", mailErr.message);
      }

      return res.json({ return_code: 1, return_message: "success" });
    }

    //  LEGACY (flow cũ 1 lần)
    if (paymentType === "legacy") {
      if (order.paymentStatus === "paid") {
        await t.rollback();
        return res.json({
          return_code: 1,
          return_message: "already processed",
        });
      }

      order.zpPaidAt = new Date(app_time);
      await _finalizeOrder(order, t);
      await t.commit();

      console.log(
        `[ZaloPay callback] ✅ LEGACY paid. Order ${order.id}. Trans: ${app_trans_id}`,
      );
      return res.json({ return_code: 1, return_message: "success" });
    }

    await t.rollback();
    return res.json({ return_code: 1, return_message: "ok" });
  } catch (err) {
    await t.rollback();
    console.error("[ZaloPay callback] Error:", err.message);
    res.json({ return_code: 0, return_message: "internal error" });
  }
});

//  POST /api/zalopay/query  — Query trạng thái (giữ nguyên)
router.post("/query", verifyToken, async (req, res) => {
  try {
    const { customOrderId, transType } = req.body;
    // transType: "deposit" | "final" | undefined (auto detect)

    const order = await CustomOrder.findByPk(customOrderId);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });
    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Không có quyền" });

    // Chọn transId cần query
    let queryTransId = null;
    if (transType === "deposit") queryTransId = order.depositTransId;
    else if (transType === "final") queryTransId = order.finalTransId;
    else {
      // Auto: ưu tiên final nếu đã tạo, không thì deposit, fallback zpTransId
      queryTransId =
        order.finalTransId || order.depositTransId || order.zpTransId;
    }

    if (!queryTransId) {
      return res.json({
        depositStatus: order.depositStatus,
        finalStatus: order.finalStatus,
        paymentStatus: order.paymentStatus,
        zpQueried: false,
      });
    }

    const macData = `${ZALOPAY.app_id}|${queryTransId}|${ZALOPAY.key1}`;
    const mac = hmac256(macData, ZALOPAY.key1);

    const zpRes = await axios.post(ZALOPAY.endpoint_query, {
      app_id: ZALOPAY.app_id,
      app_trans_id: queryTransId,
      mac,
    });

    const zpData = zpRes.data;

    res.json({
      depositStatus: order.depositStatus,
      finalStatus: order.finalStatus,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      zpReturn: {
        return_code: zpData.return_code,
        return_message: zpData.return_message,
        is_processing: zpData.is_processing,
        amount: zpData.amount,
        zp_trans_id: zpData.zp_trans_id,
      },
      zpQueried: true,
    });
  } catch (err) {
    console.error("[ZaloPay POST /query]", err.message);
    res.status(500).json({ message: "Lỗi query ZaloPay", error: err.message });
  }
});

//  POST /api/zalopay/create-order — backward compat
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { customOrderId } = req.body;
    const order = await CustomOrder.findByPk(customOrderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn gia công" });
    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });
    if (order.status !== "Chờ xác nhận")
      return res
        .status(400)
        .json({ message: "Đơn chưa ở trạng thái sẵn sàng thanh toán!" });
    if (order.paymentStatus === "paid")
      return res
        .status(400)
        .json({ message: "Đơn này đã được thanh toán rồi!" });

    const appTransId = genTransId(order.id);
    const zpData = await createZaloPayOrder({
      userId: req.user.id,
      orderId: order.id,
      amount: order.agreedPrice,
      description: `Thanh toán gia công: ${order.title}`,
      transId: appTransId,
      type: "legacy",
    });

    if (zpData.return_code !== 1) {
      return res.status(502).json({
        message: "ZaloPay từ chối tạo đơn: " + zpData.return_message,
        zpData,
      });
    }

    order.zpTransId = appTransId;
    await order.save();

    res.json({
      order_url: zpData.order_url,
      zp_trans_token: zpData.zp_trans_token,
      app_trans_id: appTransId,
    });
  } catch (err) {
    console.error("[ZaloPay POST /create-order]", err.message);
    res
      .status(500)
      .json({ message: "Lỗi tạo đơn ZaloPay", error: err.message });
  }
});

module.exports = router;
