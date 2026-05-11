const router = require('express').Router();
const authController = require('../controllers/authController');

// Gửi mã OTP trước
router.post('/request-otp', authController.requestOtp);

// Đăng ký (Xác nhận OTP kèm thông tin)
router.post('/register', authController.register);

router.post('/login', authController.login);

module.exports = router;