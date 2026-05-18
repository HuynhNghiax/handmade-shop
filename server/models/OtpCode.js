const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OtpCode = sequelize.define('OtpCode', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Thêm purpose để phân biệt OTP dùng cho đăng ký hay đặt lại mật khẩu
  purpose: {
    type: DataTypes.ENUM('register', 'reset_password'),
    allowNull: false,
    defaultValue: 'register'
  }
}, {
  timestamps: true
});

module.exports = OtpCode;