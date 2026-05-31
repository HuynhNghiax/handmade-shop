/**
 * Custom Order Routes
 * ===================
 * Workflow: Đăng yêu cầu → Báo giá → Chọn thợ → Thực hiện → Hoàn thành
 *
 * COMMISSION FLOW:
 *   1. accept-bid  → snapshot commissionRate từ MakerProfile + tính các trường commission
 *   2. confirm     → cộng dồn totalEarning vào MakerProfile + tạo CommissionDebt
 */

const router = require("express").Router();
const { Op } = require("sequelize");
const sequelize = require("../config/db");

const User = require("../models/User");
const CustomOrder = require("../models/CustomOrder");
const MakerProfile = require("../models/MakerProfile");
const Bid = require("../models/Bid");
const Review = require("../models/Review");
const CommissionDebt = require("../models/CommissionDebt");
const { verifyToken } = require("../middleware/authMiddleware");
const mailer = require("../utils/mailer");
const { COMMISSION, ORDER_STATUS } = require("../constants/business");

const CLIENT = process.env.CLIENT_URL || "http://localhost:5173";
const orderUrl = (id) => `${CLIENT}/custom-order/${id}`;

const getUser = (id) =>
  User.findByPk(id, { attributes: ["id", "name", "email"] });

//  ĐĂNG YÊU CẦU GIA CÔNG
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, budget, image, deadline } = req.body;
    const order = await CustomOrder.create({
      userId: req.user.id,
      title,
      description,
      budget,
      image,
      deadline,
    });
    res.status(201).json(order);
  } catch (err) {
    console.error("[CustomOrder POST /]", err.message);
    res.status(500).json({ message: "Lỗi đăng yêu cầu", error: err.message });
  }
});

//  DANH SÁCH ĐƠN (PUBLIC) — hỗ trợ filter theo status và makerId
router.get("/", async (req, res) => {
  try {
    const { status, makerId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (makerId) where.makerId = parseInt(makerId);

    const orders = await CustomOrder.findAll({
      where,
      include: [
        { model: User, as: "Customer", attributes: ["name", "avatar"] },
        { model: Bid, as: "Bids", attributes: ["id"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    console.error("[CustomOrder GET /]", err.message);
    res.status(500).json({ message: "Lỗi lấy danh sách", error: err.message });
  }
});

//  ĐẾM BÁO GIÁ MỚI (PROTECTED)
router.get("/my-bid-count", verifyToken, async (req, res) => {
  try {
    const orders = await CustomOrder.findAll({
      where: { userId: req.user.id, status: ORDER_STATUS.FINDING },
      include: [{ model: Bid, as: "Bids", attributes: ["id"] }],
    });
    const count = orders.filter((o) => o.Bids?.length > 0).length;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
});

//  CHI TIẾT ĐƠN (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id, {
      include: [
        { model: User, as: "Customer", attributes: ["id", "name", "avatar"] },
        { model: User, as: "Maker", attributes: ["id", "name", "avatar"] },
        {
          model: Bid,
          as: "Bids",
          include: [
            {
              model: User,
              as: "MakerUser",
              attributes: ["id", "name", "avatar"],
              include: [
                {
                  model: MakerProfile,
                  as: "MakerProfile",
                  attributes: [
                    "id",
                    "rating",
                    "totalDone",
                    "status",
                    "badge",
                    "badgeEmoji",
                    "commissionRate",
                  ],
                },
              ],
            },
          ],
          order: [["createdAt", "ASC"]],
        },
        { model: Bid, as: "AcceptedBid" },
        {
          model: Review,
          as: "Review",
          include: [
            { model: User, as: "Reviewer", attributes: ["name", "avatar"] },
          ],
        },
      ],
    });

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });
    res.json(order);
  } catch (err) {
    console.error("[CustomOrder GET /:id]", err.message);
    res
      .status(500)
      .json({ message: "Lỗi lấy chi tiết đơn", error: err.message });
  }
});

//  GỬI BÁO GIÁ
router.post("/:id/bid", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

    if (order.status !== ORDER_STATUS.FINDING)
      return res
        .status(400)
        .json({ message: "Đơn này không còn nhận báo giá nữa!" });

    if (order.userId === req.user.id)
      return res
        .status(400)
        .json({ message: "Không thể tự báo giá đơn của chính mình!" });

    const makerProfile = await MakerProfile.findOne({
      where: { userId: req.user.id, status: "da_duyet" },
    });
    if (!makerProfile)
      return res.status(403).json({
        message: "Bạn cần là thợ được Admin duyệt mới có thể báo giá!",
      });

    if (makerProfile.isBanned)
      return res.status(403).json({
        message: `Tài khoản thợ của bạn đang bị khóa. Lý do: ${makerProfile.banReason || "Vi phạm quy định"}`,
      });

    const existingBid = await Bid.findOne({
      where: { customOrderId: req.params.id, makerId: req.user.id },
    });
    if (existingBid)
      return res
        .status(400)
        .json({ message: "Bạn đã gửi báo giá cho đơn này rồi!" });

    const bid = await Bid.create({
      customOrderId: req.params.id,
      makerId: req.user.id,
      price: req.body.price,
      message: req.body.message,
      contactInfo: req.body.contactInfo,
    });

    const [customer, maker] = await Promise.all([
      getUser(order.userId),
      getUser(req.user.id),
    ]);

    mailer.notifyNewBid({
      to: customer.email,
      customerName: customer.name,
      orderTitle: order.title,
      makerName: maker.name,
      bidPrice: req.body.price,
      orderUrl: orderUrl(order.id),
    });

    res.status(201).json(bid);
  } catch (err) {
    console.error("[CustomOrder POST /:id/bid]", err.message);
    res.status(500).json({ message: "Lỗi gửi báo giá", error: err.message });
  }
});

//  KHÁCH CHỌN BÁO GIÁ
router.post("/:id/accept-bid", verifyToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await CustomOrder.findByPk(req.params.id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn" });
    }

    if (order.userId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });
    }
    if (order.status !== ORDER_STATUS.FINDING) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Đơn này không còn ở trạng thái tìm thợ!" });
    }

    const bid = await Bid.findOne({
      where: { id: req.body.bidId, customOrderId: req.params.id },
      transaction: t,
    });
    if (!bid) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy báo giá" });
    }

    const makerProfile = await MakerProfile.findOne({
      where: { userId: bid.makerId },
      transaction: t,
    });

    const rate = makerProfile?.commissionRate ?? COMMISSION.DEFAULT_RATE;
    const { commissionAmount, shopEarning, makerEarning } =
      COMMISSION.calculate(bid.price, rate);

    order.acceptedBidId = bid.id;
    order.makerId = bid.makerId;
    order.status = ORDER_STATUS.SELECTED;
    order.agreedPrice = bid.price;
    order.commissionRate = rate;
    order.commissionAmount = commissionAmount;
    order.shopEarning = shopEarning;
    order.makerEarning = makerEarning;
    order.depositAmount = Math.round(bid.price * 0.5);
    order.finalAmount = bid.price - Math.round(bid.price * 0.5);
    await order.save({ transaction: t });

    await t.commit();

    const [customer, maker] = await Promise.all([
      getUser(order.userId),
      getUser(bid.makerId),
    ]);

    mailer.notifyBidAccepted({
      to: maker.email,
      makerName: maker.name,
      orderTitle: order.title,
      customerName: customer.name,
      orderUrl: orderUrl(order.id),
    });

    res.json({
      message: "Đã chọn báo giá thành công!",
      order,
      commissionSummary: {
        agreedPrice: bid.price,
        commissionRate: rate,
        commissionAmount,
        makerEarning,
        shopEarning,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error("[CustomOrder POST /:id/accept-bid]", err.message);
    res.status(500).json({ message: "Lỗi chọn báo giá", error: err.message });
  }
});

//  THỢ XÁC NHẬN BẮT ĐẦU
router.post("/:id/start", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });
    if (order.makerId !== req.user.id)
      return res
        .status(403)
        .json({ message: "Bạn không phải thợ của đơn này!" });
    if (order.status !== ORDER_STATUS.SELECTED)
      return res
        .status(400)
        .json({ message: "Đơn không ở trạng thái chờ bắt đầu!" });
    if (order.depositStatus !== "paid") {
      return res
        .status(400)
        .json({ message: "Khách hàng chưa thanh toán cọc!" });
    }
    order.status = ORDER_STATUS.IN_PROGRESS;
    await order.save();

    const [customer, maker] = await Promise.all([
      getUser(order.userId),
      getUser(req.user.id),
    ]);
    mailer.notifyOrderStarted({
      to: customer.email,
      customerName: customer.name,
      orderTitle: order.title,
      makerName: maker.name,
      orderUrl: orderUrl(order.id),
    });

    res.json({ message: "Đã xác nhận bắt đầu thực hiện!", order });
  } catch (err) {
    console.error("[CustomOrder POST /:id/start]", err.message);
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

//  THỢ BÁO HOÀN THÀNH
router.post("/:id/complete", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });
    if (order.makerId !== req.user.id)
      return res
        .status(403)
        .json({ message: "Bạn không phải thợ của đơn này!" });
    if (order.status !== ORDER_STATUS.IN_PROGRESS)
      return res
        .status(400)
        .json({ message: 'Đơn phải đang ở trạng thái "Đang thực hiện"!' });

    order.status = ORDER_STATUS.WAITING;
    await order.save();

    const [customer, maker] = await Promise.all([
      getUser(order.userId),
      getUser(req.user.id),
    ]);
    mailer.notifyOrderReadyToConfirm({
      to: customer.email,
      customerName: customer.name,
      orderTitle: order.title,
      makerName: maker.name,
      orderUrl: orderUrl(order.id),
    });

    res.json({ message: "Đã báo hoàn thành, chờ khách xác nhận!", order });
  } catch (err) {
    console.error("[CustomOrder POST /:id/complete]", err.message);
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

//  KHÁCH XÁC NHẬN NHẬN HÀNG — COMMISSION & PAYOUT STEP
router.post("/:id/confirm", verifyToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await CustomOrder.findByPk(req.params.id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn" });
    }
    if (order.userId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });
    }
    if (order.status !== ORDER_STATUS.WAITING) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Đơn không ở trạng thái chờ xác nhận!" });
    }
    if (order.status === "Hoàn thành") {
      return res.status(400).json({ message: "Đơn này đã hoàn thành rồi!" });
    }

    order.status = ORDER_STATUS.DONE;
    await order.save({ transaction: t });

    const makerProfile = await MakerProfile.findOne({
      where: { userId: order.makerId },
      transaction: t,
    });

    if (makerProfile) {
      makerProfile.totalDone += 1;
      makerProfile.totalEarning += order.makerEarning || 0;

      const { MAKER_BADGE } = require("../constants/business");
      const tier = MAKER_BADGE.calculate(
        makerProfile.totalDone,
        makerProfile.rating,
      );
      makerProfile.badge = tier.label;
      makerProfile.badgeEmoji = tier.emoji;
      await makerProfile.save({ transaction: t });

      // CommissionDebt (phí sàn)
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

      // MakerPayout (tiền thợ nhận) ← MỚI
      const MakerPayout = require("../models/MakerPayout");
      await MakerPayout.create(
        {
          makerId: makerProfile.id,
          customOrderId: order.id,
          amount: order.makerEarning || 0,
          agreedPrice: order.agreedPrice,
          commissionRate: order.commissionRate,
          bankInfo: makerProfile.bankInfo || null,
          status: "cho_tra",
        },
        { transaction: t },
      );
    }

    await t.commit();

    res.json({
      message: "Xác nhận hoàn thành thành công!",
      order,
      summary: {
        agreedPrice: order.agreedPrice,
        makerEarning: order.makerEarning,
        commissionAmount: order.commissionAmount,
        commissionRate: order.commissionRate,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error("[CustomOrder POST /:id/confirm]", err.message);
    res.status(500).json({ message: "Lỗi xác nhận", error: err.message });
  }
});

//  KHÁCH HỦY ĐƠN
router.post("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const order = await CustomOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });
    if (order.userId !== req.user.id)
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });
    if (![ORDER_STATUS.FINDING, ORDER_STATUS.SELECTED].includes(order.status))
      return res.status(400).json({
        message: "Không thể hủy đơn đang thực hiện hoặc đã hoàn thành!",
      });

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();
    res.json({ message: "Đã hủy đơn", order });
  } catch (err) {
    console.error("[CustomOrder POST /:id/cancel]", err.message);
    res.status(500).json({ message: "Lỗi hủy đơn", error: err.message });
  }
});

router.post("/:id/cancel-with-refund", verifyToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await CustomOrder.findByPk(req.params.id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy đơn" });
    }
    if (order.userId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ message: "Bạn không phải chủ đơn này!" });
    }
    if (!["Đã chọn thợ", "Đang thực hiện"].includes(order.status)) {
      await t.rollback();
      return res.status(400).json({ message: "Không thể hủy đơn này!" });
    }
    if (order.depositStatus !== "paid") {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Đơn chưa cọc, dùng hủy thường!" });
    }

    // Thợ giữ tiền cọc — tạo payout cho thợ luôn
    const makerProfile = await MakerProfile.findOne({
      where: { userId: order.makerId },
      transaction: t,
    });

    if (makerProfile) {
      const depositAmount = order.depositAmount;
      const rate = order.commissionRate ?? COMMISSION.DEFAULT_RATE;

      // Tính hoa hồng trên tiền cọc
      const { commissionAmount, makerEarning } = COMMISSION.calculate(
        depositAmount,
        rate,
      );

      const MakerPayout = require("../models/MakerPayout");
      const existingPayout = await MakerPayout.findOne({
        where: { customOrderId: order.id },
        transaction: t,
      });
      if (!existingPayout) {
        await MakerPayout.create(
          {
            makerId: makerProfile.id,
            customOrderId: order.id,
            amount: makerEarning, // ← thợ nhận cọc TRỪ hoa hồng
            agreedPrice: depositAmount,
            commissionRate: rate,
            bankInfo: makerProfile.bankInfo || null,
            status: "cho_tra",
            note: "Khách hủy đơn sau khi cọc — thợ giữ cọc trừ hoa hồng",
          },
          { transaction: t },
        );
      }

      // CommissionDebt từ tiền cọc
      await CommissionDebt.create(
        {
          makerId: makerProfile.id,
          customOrderId: order.id,
          amount: commissionAmount, // ← shop thu hoa hồng trên cọc
          agreedPrice: depositAmount,
          commissionRate: rate,
          status: "da_thu", // ← đã thu qua ZaloPay
          paidAt: new Date(),
          note: "Hoa hồng từ tiền cọc — khách hủy đơn",
        },
        { transaction: t },
      );
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save({ transaction: t });

    await t.commit();
    res.json({ message: "Đã hủy đơn. Tiền cọc sẽ được giữ lại cho thợ." });
  } catch (err) {
    await t.rollback();
    console.error("[CustomOrder POST /:id/cancel-with-refund]", err.message);
    res.status(500).json({ message: "Lỗi hủy đơn", error: err.message });
  }
});

module.exports = router;
