/**
 * CustomOrder Model
 * =================
 * Đơn gia công giữa khách và thợ.
 *
 * COMMISSION FIELDS:
 *   agreedPrice      — Giá thợ được chọn báo (lấy từ Bid khi khách accept)
 *   commissionRate   — Tỷ lệ % tại thời điểm chốt đơn (snapshot, không đổi dù rate thợ thay đổi sau)
 *   commissionAmount — Số tiền shop thu = agreedPrice * commissionRate / 100
 *   shopEarning      — Bằng commissionAmount (để sau này có thể tách nếu có thêm phí khác)
 *   makerEarning     — Số tiền thợ thực nhận = agreedPrice - commissionAmount
 *
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CustomOrder = sequelize.define(
  "CustomOrder",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    makerId: { type: DataTypes.INTEGER, allowNull: true },
    acceptedBidId: { type: DataTypes.INTEGER, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    budget: { type: DataTypes.INTEGER, allowNull: true },
    deadline: { type: DataTypes.DATEONLY, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        "Đang tìm thợ",
        "Đã chọn thợ",
        "Đang thực hiện",
        "Chờ xác nhận",
        "Hoàn thành",
        "Đã hủy",
      ),
      defaultValue: "Đang tìm thợ",
    },
    agreedPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Giá thợ báo được chốt, lưu khi khách accept bid",
    },
    commissionRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Snapshot tỷ lệ % tại thời điểm chốt — không thay đổi sau này",
    },
    commissionAmount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Tiền shop thu = agreedPrice * commissionRate / 100",
    },
    shopEarning: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Doanh thu shop từ đơn này (hiện = commissionAmount)",
    },
    makerEarning: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Tiền thợ thực nhận = agreedPrice - commissionAmount",
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["status"] },
      { fields: ["userId"] },
      { fields: ["makerId"] },
    ],
  },
);

module.exports = CustomOrder;
