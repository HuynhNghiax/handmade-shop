/**
 * Admin Routes
 * ============
 * GET  /api/admin/stats
 * GET  /api/admin/commission
 * PUT  /api/admin/makers/:id/commission
 * PUT  /api/admin/makers/:id/ban
 *
 * Debt management:
 * GET  /api/admin/debts          — Danh sách công nợ, group theo thợ
 * PUT  /api/admin/debts/:id/mark-paid — Xác nhận đã thu tiền
 */

const router = require("express").Router();
const { Op } = require("sequelize");
const sequelize = require("../config/db");

const CustomOrder = require("../models/CustomOrder");
const Order = require("../models/Order");
const MakerProfile = require("../models/MakerProfile");
const CommissionDebt = require("../models/CommissionDebt");
const User = require("../models/User");
const { verifyAdmin } = require("../middleware/authMiddleware");
const { COMMISSION } = require("../constants/business");

//  STATS
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const regularOrders = await Order.findAll({
      where: { status: "Hoàn thành" },
      attributes: ["totalAmount"],
    });
    const regularRevenue = regularOrders.reduce((s, o) => s + o.totalAmount, 0);

    const customOrdersRevenue = await CustomOrder.findAll({
      where: { status: "Hoàn thành", shopEarning: { [Op.not]: null } },
      attributes: ["shopEarning", "agreedPrice", "makerEarning"],
    });
    const commissionRevenue = customOrdersRevenue.reduce(
      (s, o) => s + (o.shopEarning || 0),
      0,
    );
    const totalCustomGMV = customOrdersRevenue.reduce(
      (s, o) => s + (o.agreedPrice || 0),
      0,
    );

    const activeCustomOrders = await CustomOrder.count({
      where: { status: { [Op.notIn]: ["Hoàn thành", "Đã hủy"] } },
    });

    const pendingMakers = await MakerProfile.count({
      where: { status: "cho_duyet" },
    });

    // Tổng nợ chưa thu
    const pendingDebts = await CommissionDebt.findAll({
      where: { status: "chua_thu" },
      attributes: ["amount"],
    });
    const totalDebtPending = pendingDebts.reduce((s, d) => s + d.amount, 0);

    res.json({
      revenue: {
        regular: regularRevenue,
        commission: commissionRevenue,
        total: regularRevenue + commissionRevenue,
      },
      customOrders: {
        gmv: totalCustomGMV,
        active: activeCustomOrders,
      },
      makers: { pending: pendingMakers },
      debt: {
        pendingCount: pendingDebts.length,
        pendingAmount: totalDebtPending,
      },
    });
  } catch (err) {
    console.error("[Admin GET /stats]", err.message);
    res.status(500).json({ message: "Lỗi lấy thống kê", error: err.message });
  }
});

//  CHI TIẾT HOA HỒNG
router.get("/commission", verifyAdmin, async (req, res) => {
  try {
    const orders = await CustomOrder.findAll({
      where: { status: "Hoàn thành", shopEarning: { [Op.not]: null } },
      include: [
        { model: User, as: "Customer", attributes: ["name", "email"] },
        { model: User, as: "Maker", attributes: ["name", "email"] },
      ],
      order: [["updatedAt", "DESC"]],
      limit: 100,
    });

    res.json(
      orders.map((o) => ({
        id: o.id,
        title: o.title,
        customerName: o.Customer?.name,
        makerName: o.Maker?.name,
        agreedPrice: o.agreedPrice,
        commissionRate: o.commissionRate,
        commissionAmount: o.commissionAmount,
        makerEarning: o.makerEarning,
        shopEarning: o.shopEarning,
        completedAt: o.updatedAt,
      })),
    );
  } catch (err) {
    console.error("[Admin GET /commission]", err.message);
    res
      .status(500)
      .json({ message: "Lỗi lấy dữ liệu hoa hồng", error: err.message });
  }
});

//  CÔNG NỢ: DANH SÁCH ─
router.get("/debts", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query; // chua_thu | da_thu | (all)
    const where = status ? { status } : {};

    const debts = await CommissionDebt.findAll({
      where,
      include: [
        {
          model: MakerProfile,
          as: "MakerProfile",
          include: [
            {
              model: User,
              as: "User",
              attributes: ["name", "email", "avatar"],
            },
          ],
        },
        {
          model: CustomOrder,
          as: "Order",
          attributes: ["id", "title", "updatedAt"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Group theo thợ để dễ hiển thị
    const grouped = {};
    for (const debt of debts) {
      const makerId = debt.makerId;
      if (!grouped[makerId]) {
        grouped[makerId] = {
          makerId,
          makerName: debt.MakerProfile?.User?.name,
          makerEmail: debt.MakerProfile?.User?.email,
          makerAvatar: debt.MakerProfile?.User?.avatar,
          totalPending: 0,
          totalPaid: 0,
          debts: [],
        };
      }
      grouped[makerId].debts.push({
        id: debt.id,
        orderTitle: debt.Order?.title,
        orderId: debt.Order?.id,
        amount: debt.amount,
        agreedPrice: debt.agreedPrice,
        commissionRate: debt.commissionRate,
        status: debt.status,
        paidAt: debt.paidAt,
        note: debt.note,
        createdAt: debt.createdAt,
        completedAt: debt.Order?.updatedAt,
      });

      if (debt.status === "chua_thu")
        grouped[makerId].totalPending += debt.amount;
      else grouped[makerId].totalPaid += debt.amount;
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("[Admin GET /debts]", err.message);
    res.status(500).json({ message: "Lỗi lấy công nợ", error: err.message });
  }
});

//  CÔNG NỢ: XÁC NHẬN ĐÃ THU
router.put("/debts/:id/mark-paid", verifyAdmin, async (req, res) => {
  try {
    const { note } = req.body;

    const debt = await CommissionDebt.findByPk(req.params.id, {
      include: [
        {
          model: MakerProfile,
          as: "MakerProfile",
          include: [{ model: User, as: "User", attributes: ["name"] }],
        },
      ],
    });

    if (!debt)
      return res.status(404).json({ message: "Không tìm thấy khoản nợ" });
    if (debt.status === "da_thu")
      return res
        .status(400)
        .json({ message: "Khoản này đã được xác nhận rồi!" });

    debt.status = "da_thu";
    debt.paidAt = new Date();
    debt.note = note || null;
    await debt.save();

    res.json({
      message: `Đã xác nhận thu ${debt.amount.toLocaleString("vi-VN")}đ từ thợ ${debt.MakerProfile?.User?.name}`,
      debt,
    });
  } catch (err) {
    console.error("[Admin PUT /debts/:id/mark-paid]", err.message);
    res.status(500).json({ message: "Lỗi xác nhận", error: err.message });
  }
});

//  CHỈNH TỶ LỆ HOA HỒNG ─
router.put("/makers/:id/commission", verifyAdmin, async (req, res) => {
  try {
    const { commissionRate } = req.body;
    if (
      commissionRate < COMMISSION.MIN_RATE ||
      commissionRate > COMMISSION.MAX_RATE
    ) {
      return res.status(400).json({
        message: `Tỷ lệ hoa hồng phải trong khoảng ${COMMISSION.MIN_RATE}% - ${COMMISSION.MAX_RATE}%`,
      });
    }

    const profile = await MakerProfile.findByPk(req.params.id);
    if (!profile)
      return res.status(404).json({ message: "Không tìm thấy thợ" });

    profile.commissionRate = commissionRate;
    await profile.save();

    res.json({
      message: `Đã cập nhật hoa hồng thành ${commissionRate}%`,
      profile,
    });
  } catch (err) {
    console.error("[Admin PUT /makers/:id/commission]", err.message);
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

//  KHÓA / MỞ KHÓA THỢ ─
router.put("/makers/:id/ban", verifyAdmin, async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;

    const profile = await MakerProfile.findByPk(req.params.id, {
      include: [{ model: User, as: "User", attributes: ["name"] }],
    });
    if (!profile)
      return res.status(404).json({ message: "Không tìm thấy thợ" });

    profile.isBanned = isBanned;
    profile.banReason = isBanned ? banReason || "Vi phạm quy định" : null;
    await profile.save();

    const action = isBanned ? "Khóa" : "Mở khóa";
    res.json({
      message: `${action} tài khoản thợ ${profile.User?.name} thành công`,
      profile,
    });
  } catch (err) {
    console.error("[Admin PUT /makers/:id/ban]", err.message);
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

module.exports = router;
