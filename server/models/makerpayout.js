/**
 * MakerPayout Model
 * =================
 * Theo dõi việc shop trả tiền (makerEarning) cho thợ sau khi đơn hoàn thành.
 *
 * Flow:
 *   Đơn hoàn thành (ZaloPay callback / manual confirm)
 *     → tạo MakerPayout (status: cho_tra)
 *   Admin xác nhận đã chuyển tiền
 *     → status: da_tra, paidAt: now
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const MakerPayout = sequelize.define(
  "MakerPayout",
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
      comment: "Mỗi đơn chỉ có 1 khoản thanh toán cho thợ",
    },

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Số tiền thợ nhận = makerEarning",
    },

    agreedPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Giá chốt của đơn (context)",
    },

    commissionRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Tỷ lệ hoa hồng tại thời điểm đơn hoàn thành",
    },

    bankInfo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Snapshot thông tin NH của thợ tại thời điểm tạo payout",
    },

    status: {
      type: DataTypes.ENUM("cho_tra", "da_tra"),
      defaultValue: "cho_tra",
    },

    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Thời điểm admin xác nhận đã chuyển khoản",
    },

    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Ghi chú admin (mã CK, ngân hàng đã dùng...)",
    },
  },
  {
    timestamps: true,
    indexes: [{ fields: ["makerId"] }, { fields: ["status"] }],
  },
);

module.exports = MakerPayout;
