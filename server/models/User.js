const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  // Nullable để hỗ trợ tài khoản Google OAuth (không có password riêng)
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Lưu Google ID để liên kết tài khoản
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = User;