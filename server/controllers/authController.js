const User    = require('../models/User');
const OtpCode = require('../models/OtpCode');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const _generateAndSendOtp = async (email, purpose, mailSubject, mailHtml) => {
  const otp       = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60000); // 5 phút

  await OtpCode.destroy({ where: { email, purpose } });
  await OtpCode.create({ email, code: otp, expiresAt, purpose });

  await transporter.sendMail({
    from: `"PinkyCrafts Support" <${process.env.EMAIL_USER}>`,
    to:   email,
    subject: mailSubject,
    html: mailHtml(otp),
  });

  return otp; 
};

/**
 * Tạo JWT token từ user object — dùng chung cho đăng nhập thường và Google OAuth.
 */
const _generateToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.JWT_SEC,
    { expiresIn: '3d' }
  );
};

/**
 * Chuẩn hóa dữ liệu user trả về client — ẩn password, thêm token.
 */
const _formatUserResponse = (user, token) => {
  const { password, googleId, ...userData } = user.toJSON();
  return { ...userData, accessToken: token };
};

// ĐĂNG KÝ: BƯỚC 1 — GỬI OTP
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Email này đã được đăng ký!" });
    }

    await _generateAndSendOtp(
      email,
      'register',
      'Mã xác thực OTP Đăng ký PinkyCrafts',
      (otp) => `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f43f5e;">Chào mừng bạn đến với PinkyCrafts!</h2>
          <p>Mã xác thực đăng ký của bạn là:</p>
          <h1 style="background: #fff1f2; padding: 10px; color: #f43f5e; text-align: center; border-radius: 5px;">${otp}</h1>
          <p>Mã này có hiệu lực trong <b>5 phút</b>. Không chia sẻ mã này với bất kỳ ai.</p>
        </div>
      `
    );

    res.status(200).json({ message: "Mã OTP đã được gửi về Gmail của bạn!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi gửi mã OTP!", error: error.message });
  }
};

// ĐĂNG KÝ: BƯỚC 2 — XÁC NHẬN OTP & TẠO TÀI KHOẢN
exports.register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const otpRecord = await OtpCode.findOne({
      where: { email, code: otp, purpose: 'register' }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Mã OTP không chính xác!" });
    }
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn!" });
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({ name, email, password: hashedPassword });
    await OtpCode.destroy({ where: { email, purpose: 'register' } });

    res.status(201).json({ message: "Đăng ký tài khoản thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng ký!", error: error.message });
  }
};

// ĐĂNG NHẬP THƯỜNG
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Thông tin không chính xác!" });
    }

    // Tài khoản chỉ có Google (password = null) không được đăng nhập bằng form
    if (!user.password) {
      return res.status(401).json({
        message: "Tài khoản này đăng nhập bằng Google. Vui lòng dùng nút 'Đăng nhập với Google'."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Thông tin không chính xác!" });
    }

    const token = _generateToken(user);
    res.status(200).json(_formatUserResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng nhập!", error: error.message });
  }
};

// QUÊN MẬT KHẨU: BƯỚC 1 — GỬI OTP
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Trả thông báo chung để tránh lộ thông tin email nào đã đăng ký
      return res.status(200).json({
        message: "Nếu email này tồn tại, mã OTP đã được gửi đến Gmail của bạn."
      });
    }

    // Không cho reset password nếu tài khoản chỉ đăng nhập bằng Google
    if (!user.password) {
      return res.status(400).json({
        message: "Tài khoản này đăng nhập bằng Google, không có mật khẩu để đặt lại."
      });
    }

    await _generateAndSendOtp(
      email,
      'reset_password',
      'Đặt lại mật khẩu PinkyCrafts',
      (otp) => `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f43f5e;">Đặt lại mật khẩu PinkyCrafts</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <b>${email}</b>.</p>
          <p>Mã xác thực của bạn là:</p>
          <h1 style="background: #fff1f2; padding: 10px; color: #f43f5e; text-align: center; border-radius: 5px;">${otp}</h1>
          <p>Mã này có hiệu lực trong <b>5 phút</b>.</p>
          <p style="color: #999; font-size: 13px;">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        </div>
      `
    );

    res.status(200).json({
      message: "Nếu email này tồn tại, mã OTP đã được gửi đến Gmail của bạn."
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi gửi mã OTP!", error: error.message });
  }
};

// QUÊN MẬT KHẨU: BƯỚC 2 — XÁC NHẬN OTP & ĐẶT LẠI MẬT KHẨU 
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await OtpCode.findOne({
      where: { email, code: otp, purpose: 'reset_password' }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Mã OTP không chính xác!" });
    }
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn!" });
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.update({ password: hashedPassword }, { where: { email } });
    await OtpCode.destroy({ where: { email, purpose: 'reset_password' } });

    res.status(200).json({ message: "Đặt lại mật khẩu thành công! Hãy đăng nhập lại." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đặt lại mật khẩu!", error: error.message });
  }
};

// ─── GOOGLE OAUTH: XỬ LÝ SAU KHI GOOGLE XÁC THỰC THÀNH CÔNG ─────────────────
/**
 * Hàm này được gọi từ route /api/auth/google/callback sau khi passport xác thực xong.
 * req.user được passport gắn vào sau khi GoogleStrategy chạy thành công.
 */
exports.googleCallback = (req, res) => {
  try {
    const user  = req.user;
    const token = _generateToken(user);

    // Đóng gói dữ liệu user để truyền qua URL cho frontend
    const userPayload = encodeURIComponent(
      JSON.stringify(_formatUserResponse(user, token))
    );

    // Redirect về frontend, frontend sẽ đọc query param và lưu vào context
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?user=${userPayload}`
    );
  } catch (error) {
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=google_auth_failed`
    );
  }
};