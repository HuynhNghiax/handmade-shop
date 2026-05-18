const router   = require('express').Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// ĐĂNG KÝ (Email + OTP)
router.post('/register',    authController.register);

// ĐĂNG NHẬP THƯỜNG
router.post('/login', authController.login);

// QUÊN MẬT KHẨU
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password',         authController.resetPassword);

// GOOGLE OAUTH 2.0
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,              
  })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  authController.googleCallback
);

module.exports = router;