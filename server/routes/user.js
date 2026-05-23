const router = require("express").Router();
const User = require("../models/User");
const Order = require("../models/Order");
const CustomOrder = require("../models/CustomOrder");
const Bid = require("../models/Bid");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

router.get("/my-profile", verifyToken, async (req, res) => {
  try {
    const myOrders = await Order.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    const myRequests = await CustomOrder.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Bid, as: "Bids", include: [{ model: User, as: "MakerUser", attributes: ["name"] }] },
      ],
    });

    // Thêm acceptedBidId để thợ biết bid nào được chọn
    const myBids = await Bid.findAll({
      where: { makerId: req.user.id },
      include: [
        {
          model: CustomOrder,
          as: "CustomOrder",
          attributes: ["id", "title", "status", "acceptedBidId"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ myOrders, myRequests, myBids });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy profile", error: err.message });
  }
});

router.put("/my-profile", verifyToken, async (req, res) => {
  try {
    const { name, avatar, phone, address, oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (oldPassword && newPassword) {
      if (!user.password) {
        return res.status(400).json({
          message:
            "Tài khoản đăng nhập bằng Google, hãy dùng quên mật khẩu để tạo mật khẩu trước.",
        });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.status(200).json({
      message: "Cập nhật thành công",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi cập nhật profile", error: err.message });
  }
});

router.get("/", verifyAdmin, async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ["password"] } });
  res.json(users);
});

module.exports = router;
