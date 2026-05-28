const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post('/', verifyToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Không tìm thấy file" });
        }
        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.status(200).json({ url: fileUrl });
    } catch (error) {
        res.status(500).json({ message: "Lỗi upload ảnh", error: error.message });
    }
});

module.exports = router;
