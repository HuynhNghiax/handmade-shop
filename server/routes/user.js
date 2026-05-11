const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const CustomOrder = require('../models/CustomOrder');
const Bid = require('../models/Bid');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/my-profile', verifyToken, async (req, res) => {
    try {
        // 1. Đơn hàng mua sẵn
        const myOrders = await Order.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        // 2. Yêu cầu gia công đã đăng
        const myRequests = await CustomOrder.findAll({
            where: { userId: req.user.id },
            include: [{ model: Bid, include: [{ model: User, attributes: ['name'] }] }]
        });

        // 3. Báo giá đã gửi (Maker)
        const myBids = await Bid.findAll({
            where: { makerId: req.user.id },
            include: [{ model: CustomOrder, attributes: ['title', 'status'] }]
        });

        res.status(200).json({ myOrders, myRequests, myBids });
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy profile", error: err.message });
    }
});

// Các API khác cho Admin
router.get('/', verifyAdmin, async (req, res) => {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
});

module.exports = router;