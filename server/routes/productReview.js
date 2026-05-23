const router = require("express").Router();
const { ProductReview, User, Order } = require("../models/associations");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// 1. Get all reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await ProductReview.findAll({
      where: { productId: req.params.productId },
      include: [{ model: User, as: "User", attributes: ["id", "name", "avatar"] }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đánh giá", error: err.message });
  }
});

// 2. Check eligibility to review
router.get("/:productId/eligibility", verifyToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const userId = req.user.id;

    // Check if user already reviewed
    const existingReview = await ProductReview.findOne({
      where: { productId, userId },
    });

    if (existingReview) {
      return res.status(200).json({ canReview: false, hasReviewed: true, review: existingReview });
    }

    // Check if user has bought this product and received it
    const orders = await Order.findAll({
      where: { userId, status: "Hoàn thành" },
    });

    let hasBought = false;
    for (let order of orders) {
      if (order.products && Array.isArray(order.products)) {
        const found = order.products.find(p => p.id === productId);
        if (found) {
          hasBought = true;
          break;
        }
      }
    }

    if (hasBought) {
      return res.status(200).json({ canReview: true, hasReviewed: false });
    } else {
      return res.status(200).json({ canReview: false, hasReviewed: false });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi kiểm tra quyền", error: err.message });
  }
});

// 3. Create a review
router.post("/:productId", verifyToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Validate if already reviewed
    const existing = await ProductReview.findOne({ where: { productId, userId } });
    if (existing) return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi!" });

    // Validate if bought
    const orders = await Order.findAll({ where: { userId, status: "Hoàn thành" } });
    let hasBought = false;
    for (let order of orders) {
      if (order.products && Array.isArray(order.products)) {
        const found = order.products.find(p => p.id === productId);
        if (found) {
          hasBought = true;
          break;
        }
      }
    }

    if (!hasBought) {
      return res.status(403).json({ message: "Bạn phải mua và nhận hàng thành công mới được đánh giá." });
    }

    const review = await ProductReview.create({
      productId,
      userId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo đánh giá", error: err.message });
  }
});

// 4. Update a review (Only owner)
router.put("/:reviewId", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await ProductReview.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền sửa đánh giá này" });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: "Lỗi sửa đánh giá", error: err.message });
  }
});

// 5. Delete a review (Only owner)
router.delete("/:reviewId", verifyToken, async (req, res) => {
  try {
    const review = await ProductReview.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xóa đánh giá này" });
    }

    await review.destroy();
    res.status(200).json({ message: "Xóa đánh giá thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa đánh giá", error: err.message });
  }
});

// 6. Admin reply to review
router.put("/:reviewId/reply", verifyAdmin, async (req, res) => {
  try {
    const { adminReply } = req.body;
    const review = await ProductReview.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    review.adminReply = adminReply;
    await review.save();

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: "Lỗi trả lời đánh giá", error: err.message });
  }
});

module.exports = router;
