const router = require('express').Router();
const Order = require('../models/Order');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// 1. Tạo đơn hàng (User)
router.post('/', verifyToken, async (req, res) => {
    try {
        const newOrder = await Order.create({ ...req.body, userId: req.user.id });
        res.status(201).json(newOrder);
    } catch (err) { res.status(500).json(err); }
});

// 2. Lấy toàn bộ đơn hàng (Admin xem hết, User xem của mình)
router.get('/', verifyToken, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: req.user.isAdmin ? {} : { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (err) { res.status(500).json(err); }
});

// 3. Admin cập nhật trạng thái (Đang giao, Đã hủy...)
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        await Order.update({ status: req.body.status }, { where: { id: req.params.id } });
        res.status(200).json("Cập nhật trạng thái thành công");
    } catch (err) { res.status(500).json(err); }
});

// 4. KHÁCH HÀNG XÁC NHẬN ĐÃ NHẬN HÀNG (MỚI)
router.put('/:id/confirm', verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!order) return res.status(404).json("Không tìm thấy đơn hàng");
        
        // Chỉ cho phép xác nhận khi đơn đang ở trạng thái "Đang giao"
        order.status = "Hoàn thành";
        await order.save();
        
        res.status(200).json("Xác nhận đã nhận hàng thành công!");
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;