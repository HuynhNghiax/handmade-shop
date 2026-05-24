/**
 * Admin Stats Route
 * =================
 * Tổng hợp số liệu cho Admin Dashboard.
 * Tách riêng khỏi các route khác để dễ mở rộng sau.
 *
 * Endpoints:
 *   GET /api/admin/stats        — Tổng quan: doanh thu, đơn hàng, thợ
 *   GET /api/admin/commission   — Chi tiết hoa hồng từ custom orders
 *   PUT /api/admin/makers/:id/commission — Admin chỉnh tỷ lệ hoa hồng của thợ
 *   PUT /api/admin/makers/:id/ban        — Admin khóa/mở khóa thợ
 */

const router = require("express").Router();
const { Op } = require("sequelize");
const sequelize = require("../config/db");

const CustomOrder = require("../models/CustomOrder");
const Order = require("../models/Order");
const MakerProfile = require("../models/MakerProfile");
const User = require("../models/User");
const { verifyAdmin } = require("../middleware/authMiddleware");
const { COMMISSION } = require("../constants/business");

router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    // Doanh thu từ đơn thường (shop bán sản phẩm)
    const regularOrders = await Order.findAll({
      where: { status: "Hoàn thành" },
      attributes: ["totalAmount"],
    });
    const regularRevenue = regularOrders.reduce((s, o) => s + o.totalAmount, 0);

    // Doanh thu hoa hồng từ custom orders
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

    // Đơn custom đang hoạt động
    const activeCustomOrders = await CustomOrder.count({
      where: { status: { [Op.notIn]: ["Hoàn thành", "Đã hủy"] } },
    });

    // Thợ chờ duyệt
    const pendingMakers = await MakerProfile.count({
      where: { status: "cho_duyet" },
    });

    res.json({
      revenue: {
        regular: regularRevenue, // Doanh thu bán sản phẩm
        commission: commissionRevenue, // Hoa hồng từ gia công
        total: regularRevenue + commissionRevenue,
      },
      customOrders: {
        gmv: totalCustomGMV, // Tổng giá trị giao dịch qua sàn
        active: activeCustomOrders,
      },
      makers: {
        pending: pendingMakers,
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
      where: {
        status: "Hoàn thành",
        shopEarning: { [Op.not]: null },
      },
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

//  CHỈNH TỶ LỆ HOA HỒNG CỦA THỢ
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

//  KHÓA / MỞ KHÓA THỢ
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
