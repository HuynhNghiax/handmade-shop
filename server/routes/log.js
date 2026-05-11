const router = require('express').Router();
const Log = require('../models/Log');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Lấy danh sách log cho Admin
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const logs = await Log.findAll({ 
            order: [['createdAt', 'DESC']],
            limit: 50 
        });
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy nhật ký", error: err.message });
    }
});

// API phụ để ghi log từ các nơi khác (Không cần verifyAdmin vì dùng nội bộ)
router.post('/add', async (req, res) => {
    try {
        const newLog = await Log.create(req.body);
        res.status(201).json(newLog);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;