/**
 * CommissionDebt Model
 * ====================
 * Ghi nhận khoản nợ commission mỗi khi đơn gia công hoàn thành.
 * Mỗi đơn chỉ tạo đúng 1 record (unique customOrderId).
 *
 * Flow:
 *   Đơn confirm → tạo CommissionDebt (status: chua_thu)
 *   Admin xác nhận thu tiền → status: da_thu, paidAt: now
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CommissionDebt = sequelize.define(
  "CommissionDebt",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    makerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK đến MakerProfile.id",
    },

    customOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: "Mỗi đơn chỉ sinh 1 khoản nợ",
    },

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Số tiền thợ nợ shop = shopEarning của đơn",
    },

    agreedPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Giá chốt của đơn — để hiển thị context",
    },

    commissionRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Tỷ lệ % tại thời điểm đơn hoàn thành",
    },

    status: {
      type: DataTypes.ENUM("chua_thu", "da_thu"),
      defaultValue: "chua_thu",
    },

    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Thời điểm admin xác nhận đã thu tiền",
    },

    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Ghi chú từ admin khi xác nhận (số CK, nội dung...)",
    },
  },
  {
    timestamps: true,
    indexes: [{ fields: ["makerId"] }, { fields: ["status"] }],
  },
);

module.exports = CommissionDebt;
