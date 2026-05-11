const router = require('express').Router();
const CustomOrder = require('../models/CustomOrder');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

// 1. Đăng yêu cầu gia công mới
router.post('/', verifyToken, async (req, res) => {
    try {
        const newOrder = await CustomOrder.create({ 
            ...req.body, 
            userId: req.user.id 
        });
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ message: "Lỗi đăng yêu cầu", error: err.message });
    }
});

// 2. Lấy danh sách tất cả yêu cầu
router.get('/', async (req, res) => {
    try {
        const orders = await CustomOrder.findAll({ 
            include: [{ model: User, attributes: ['name'] }], 
            order: [['createdAt', 'DESC']] 
        });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. Gửi báo giá cho một yêu cầu cụ thể (CÓ CHẶN CHÍNH CHỦ)
router.post('/:id/bid', verifyToken, async (req, res) => {
    try {
        // Tìm bài đăng để kiểm tra chủ sở hữu
        const order = await CustomOrder.findByPk(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: "Yêu cầu không tồn tại!" });
        }

        // KIỂM TRA: Nếu người báo giá là chủ bài đăng thì chặn lại
        if (order.userId === req.user.id) {
            return res.status(400).json({ message: "Sếp ơi, sếp không thể tự báo giá cho yêu cầu của chính mình!" });
        }

        const newBid = await Bid.create({
            customOrderId: req.params.id,
            makerId: req.user.id,
            price: req.body.price,
            message: req.body.message,
            contactInfo: req.body.contactInfo
        });
        res.status(201).json(newBid);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;