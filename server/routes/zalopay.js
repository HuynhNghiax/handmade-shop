/**
 * ZaloPay Routes
 * ==============
 * POST /api/zalopay/create-order   — Tạo đơn ZaloPay cho custom order
 * POST /api/zalopay/callback       — ZaloPay gọi về khi thanh toán xong
 * POST /api/zalopay/query          — Query trạng thái giao dịch
 *
 * SECURITY: Key1 & Key2 chỉ dùng phía server, KHÔNG gửi về client
 */

const router = require("express").Router();
const axios = require("axios");
const crypto = require("crypto");
const { verifyToken } = require("../middleware/authMiddleware");
const CustomOrder = require("../models/CustomOrder");
const MakerProfile = require("../models/MakerProfile");
const CommissionDebt = require("../models/CommissionDebt");
const { MAKER_BADGE } = require("../constants/business");
const sequelize = require("../config/db");

//  CONFIG
const ZALOPAY = {
  app_id: parseInt(process.env.ZALOPAY_APP_ID),
  key1: process.env.ZALOPAY_MAC_KEY,
  key2: process.env.ZALOPAY_REFUND_KEY,
  endpoint_create: "https://sb-openapi.zalopay.vn/v2/create",
  endpoint_query: "https://sb-openapi.zalopay.vn/v2/query",
};

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

//  HELPER: Tạo app_trans_id theo format yymmdd_xxx
const genTransId = (orderId) => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `${yy}${mm}${dd}_pinky${orderId}_${rand}`;
};

//  HELPER: Tính MAC
const hmac256 = (data, key) =>
  crypto.createHmac("sha256", key).update(data).digest("hex");

//  TẠO ĐƠN ZALOPAY
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { customOrderId } = req.body;

    // 1. Lấy đơn gia công
    const order = await CustomOrder.findByPk(customOrderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn gia công" });
    }

    // 2. Kiểm tra quyền: chỉ chủ đơn mới thanh toán
    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });
    }

    // 3. Đơn phải ở trạng thái "Chờ xác nhận"
    if (order.status !== "Chờ xác nhận") {
      return res
        .status(400)
        .json({ message: "Đơn chưa ở trạng thái sẵn sàng thanh toán!" });
    }

    // 4. Kiểm tra đã thanh toán chưa
    if (order.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ message: "Đơn này đã được thanh toán rồi!" });
    }

    const appTransId = genTransId(order.id);
    const appTime = Date.now();
    const amount = order.agreedPrice; // VND

    const embedData = JSON.stringify({
      customOrderId: order.id,
      redirecturl: `${CLIENT_URL}/custom-order/${order.id}`,
    });

    const items = JSON.stringify([
      {
        itemid: `custom_order_${order.id}`,
        itemname: order.title,
        itemprice: amount,
        itemquantity: 1,
      },
    ]);

    // 5. Tính MAC theo đúng spec ZaloPay
    // data = app_id|app_trans_id|app_user|amount|app_time|embed_data|item
    const macData = [
      ZALOPAY.app_id,
      appTransId,
      `user_${req.user.id}`,
      amount,
      appTime,
      embedData,
      items,
    ].join("|");

    const mac = hmac256(macData, ZALOPAY.key1);

    const payload = {
      app_id: ZALOPAY.app_id,
      app_user: `user_${req.user.id}`,
      app_trans_id: appTransId,
      app_time: appTime,
      amount,
      item: items,
      description: `PinkyCrafts - Thanh toán gia công: ${order.title}`,
      embed_data: embedData,
      callback_url: `${process.env.SERVER_URL || "http://localhost:5000"}/api/zalopay/callback`,
      bank_code: "", // để trống = hiện đủ phương thức
      mac,
    };

    // 6. Gọi ZaloPay API
    const zpRes = await axios.post(ZALOPAY.endpoint_create, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const zpData = zpRes.data;

    if (zpData.return_code !== 1) {
      console.error("[ZaloPay create-order] Error:", zpData);
      return res.status(502).json({
        message: "ZaloPay từ chối tạo đơn: " + zpData.return_message,
        zpData,
      });
    }

    // 7. Lưu app_trans_id vào order để sau callback tìm lại
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

//  CALLBACK TỪ ZALOPAY
// ZaloPay POST về đây sau khi user thanh toán
// Phải verify MAC bằng Key2 trước khi xử lý
router.post("/callback", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { data: cbData, mac: cbMac } = req.body;

    // 1. Verify MAC bằng Key2
    const expectedMac = hmac256(cbData, ZALOPAY.key2);
    if (cbMac !== expectedMac) {
      await t.rollback();
      console.warn("[ZaloPay callback] MAC mismatch! Possible fraud attempt.");
      return res.json({ return_code: -1, return_message: "MAC không hợp lệ" });
    }

    const parsed = JSON.parse(cbData);
    const { app_trans_id, amount, app_time } = parsed;

    // 2. Tìm custom order theo zpTransId
    const order = await CustomOrder.findOne({
      where: { zpTransId: app_trans_id },
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      console.warn(
        "[ZaloPay callback] Order not found for trans:",
        app_trans_id,
      );
      return res.json({ return_code: 1, return_message: "ok" }); // Trả ok để ZaloPay không retry
    }

    // 3. Idempotency: nếu đã xử lý rồi thì bỏ qua
    if (order.paymentStatus === "paid") {
      await t.rollback();
      return res.json({ return_code: 1, return_message: "already processed" });
    }

    // 4. Xác nhận thanh toán thành công → chuyển trạng thái
    order.paymentStatus = "paid";
    order.zpPaidAt = new Date(app_time);
    order.status = "Hoàn thành";
    await order.save({ transaction: t });

    // 5. Cập nhật MakerProfile & tạo CommissionDebt
    const makerProfile = await MakerProfile.findOne({
      where: { userId: order.makerId },
      transaction: t,
    });

    if (makerProfile) {
      makerProfile.totalDone += 1;
      makerProfile.totalEarning += order.makerEarning || 0;

      const tier = MAKER_BADGE.calculate(
        makerProfile.totalDone,
        makerProfile.rating,
      );
      makerProfile.badge = tier.label;
      makerProfile.badgeEmoji = tier.emoji;
      await makerProfile.save({ transaction: t });

      // Tạo CommissionDebt (tránh duplicate)
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
    }

    await t.commit();

    console.log(
      `[ZaloPay callback] ✅ Order ${order.id} paid & completed. Trans: ${app_trans_id}`,
    );
    res.json({ return_code: 1, return_message: "success" });
  } catch (err) {
    await t.rollback();
    console.error("[ZaloPay callback] Error:", err.message);
    res.json({ return_code: 0, return_message: "internal error" });
  }
});

//  QUERY TRẠNG THÁI
router.post("/query", verifyToken, async (req, res) => {
  try {
    const { customOrderId } = req.body;

    const order = await CustomOrder.findByPk(customOrderId);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });
    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Không có quyền" });
    if (!order.zpTransId) {
      return res.json({
        paymentStatus: order.paymentStatus || "unpaid",
        zpQueried: false,
      });
    }

    // Tính MAC cho query: data = app_id|app_trans_id|key1
    const macData = `${ZALOPAY.app_id}|${order.zpTransId}|${ZALOPAY.key1}`;
    const mac = hmac256(macData, ZALOPAY.key1);

    const zpRes = await axios.post(ZALOPAY.endpoint_query, {
      app_id: ZALOPAY.app_id,
      app_trans_id: order.zpTransId,
      mac,
    });

    const zpData = zpRes.data;

    res.json({
      paymentStatus: order.paymentStatus || "unpaid",
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

module.exports = router;
