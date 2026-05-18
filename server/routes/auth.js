const router   = require('express').Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// ĐĂNG KÝ
router.post('/request-otp', authController.requestOtp);
router.post('/register',    authController.register);

// ĐĂNG NHẬP THƯỜNG
router.post('/login', authController.login);

// QUÊN MẬT KHẨU
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password',         authController.resetPassword);

// GOOGLE OAUTH 
// Bước 1: Redirect sang Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// GOOGLE OAUTH 
// Bước 2: Google redirect về đây
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
      }

      if (!user) {
        // Passport trả về false — kiểm tra lý do cụ thể
        const reason = info?.message === 'EMAIL_HAS_PASSWORD'
          ? 'email_has_password'
          : 'google_auth_failed';
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${reason}`);
      }

      // Thành công
      req.user = user;
      return authController.googleCallback(req, res);
    })(req, res, next);
  }
);

module.exports = router;