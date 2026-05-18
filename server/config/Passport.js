const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, googleProfile, done) => {
        try {
          const email    = googleProfile.emails[0].value;
          const name     = googleProfile.displayName;
          const googleId = googleProfile.id;

          // Bước 1: Tìm user đã liên kết Google ID này chưa → đăng nhập thẳng
          let user = await User.findOne({ where: { googleId } });
          if (user) {
            return done(null, user);
          }

          // Bước 2: Kiểm tra email đã đăng ký bằng mật khẩu thường chưa
          user = await User.findOne({ where: { email } });
          if (user && user.password) {
            // Chặn — không cho dùng Google để vào tài khoản có mật khẩu riêng
            return done(null, false, { message: 'EMAIL_HAS_PASSWORD' });
          }

          // Bước 3: Tạo tài khoản brand-new qua Google
          const randomPassword = await bcrypt.hash(
            `${googleId}_${Math.random().toString(36)}`,
            10
          );
          user = await User.create({ name, email, password: randomPassword, googleId });
          return done(null, user);

        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};

module.exports = configurePassport;