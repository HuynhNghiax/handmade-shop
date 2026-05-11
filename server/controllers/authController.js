const User = require('../models/User');
const OtpCode = require('../models/OtpCode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Cấu hình gửi mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// BƯỚC 1: GỬI MÃ OTP
exports.requestOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra xem email đã tồn tại chưa
        const userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(400).json({ message: "Email này đã được đăng ký!" });

        // Tạo mã OTP 6 số ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000); // Hết hạn sau 5 phút

        // Lưu OTP vào database (xóa cái cũ nếu có)
        await OtpCode.destroy({ where: { email } });
        await OtpCode.create({ email, code: otp, expiresAt });

        // Gửi mail
        const mailOptions = {
            from: `"PinkyCrafts Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Mã xác thực OTP Đăng ký PinkyCrafts",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #f43f5e;">Chào mừng bạn đến với PinkyCrafts!</h2>
                    <p>Mã xác thực đăng ký của bạn là:</p>
                    <h1 style="background: #fff1f2; padding: 10px; color: #f43f5e; text-align: center; border-radius: 5px;">${otp}</h1>
                    <p>Mã này có hiệu lực trong <b>5 phút</b>. Không chia sẻ mã này với bất kỳ ai.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Mã OTP đã được gửi về Gmail của bạn!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi gửi mã OTP!", error: error.message });
    }
};

// BƯỚC 2: XÁC NHẬN OTP VÀ TẠO TÀI KHOẢN
exports.register = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        // Kiểm tra OTP trong DB
        const otpRecord = await OtpCode.findOne({ where: { email, code: otp } });
        
        if (!otpRecord) return res.status(400).json({ message: "Mã OTP không chính xác!" });
        if (new Date() > otpRecord.expiresAt) return res.status(400).json({ message: "Mã OTP đã hết hạn!" });

        // Mã hóa mật khẩu và tạo user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({ name, email, password: hashedPassword });
        
        // Xóa mã OTP sau khi dùng xong
        await OtpCode.destroy({ where: { email } });

        res.status(201).json({ message: "Đăng ký tài khoản thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đăng ký!", error: error.message });
    }
};

// LOGIC ĐĂNG NHẬP (Giữ nguyên)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: "Thông tin không chính xác!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Thông tin không chính xác!" });

        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SEC, { expiresIn: '3d' });
        const { password: userPassword, ...userData } = user.toJSON();
        res.status(200).json({ ...userData, accessToken: token });
    } catch (error) {
        res.status(500).json({ message: "Lỗi đăng nhập!", error: error.message });
    }
};