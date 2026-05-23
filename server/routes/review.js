const router = require("express").Router();
const CustomOrder = require("../models/CustomOrder");
const MakerProfile = require("../models/MakerProfile");
const Review = require("../models/Review");
const { verifyToken } = require("../middleware/authMiddleware");

//  tính lại rating trung bình
const recalcRating = async (makerId) => {
  const reviews = await Review.findAll({ where: { makerId } });
  if (!reviews.length) return;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await MakerProfile.update(
    { rating: Math.round(avg * 10) / 10 },
    { where: { id: makerId } },
  );
};

//  POST /api/reviews
router.post("/", verifyToken, async (req, res) => {
  try {
    const { customOrderId, makerId, rating, comment } = req.body;

    // Lấy đơn và kiểm tra điều kiện
    const order = await CustomOrder.findByPk(customOrderId);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn" });

    if (order.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Chỉ chủ đơn mới được đánh giá!" });
    }
    if (order.status !== "Hoàn thành") {
      return res
        .status(400)
        .json({ message: "Đơn phải Hoàn thành mới được đánh giá!" });
    }

    // Chặn đánh giá trùng (unique index ở model đã xử lý, nhưng nên check sớm)
    const existing = await Review.findOne({ where: { customOrderId } });
    if (existing) {
      return res.status(400).json({ message: "Đơn này đã được đánh giá rồi!" });
    }

    // Lấy MakerProfile từ userId của thợ
    const makerProfile = await MakerProfile.findOne({
      where: { userId: order.makerId },
    });
    if (!makerProfile) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ thợ" });
    }

    const review = await Review.create({
      customOrderId,
      reviewerId: req.user.id,
      makerId: makerProfile.id,
      rating,
      comment,
    });

    // Tính lại rating trung bình
    await recalcRating(makerProfile.id);

    res.status(201).json({ message: "Đánh giá thành công!", review });
  } catch (err) {
    // Sequelize unique constraint violation
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Đơn này đã được đánh giá rồi!" });
    }
    res.status(500).json({ message: "Lỗi gửi đánh giá", error: err.message });
  }
});

module.exports = router;
