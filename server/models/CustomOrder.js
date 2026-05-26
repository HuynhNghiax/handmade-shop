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
    //  Commission fields
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
    },
    makerEarning: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Tiền thợ thực nhận = agreedPrice - commissionAmount",
    },
    //  ZaloPay fields
    zpTransId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "app_trans_id gửi cho ZaloPay, dùng để đối soát callback",
    },
    paymentStatus: {
      type: DataTypes.ENUM("unpaid", "paid", "refunded"),
      defaultValue: "unpaid",
      comment: "unpaid = chưa thanh toán | paid = đã TT qua ZaloPay",
    },
    zpPaidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Thời điểm ZaloPay confirm thanh toán thành công",
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["status"] },
      { fields: ["userId"] },
      { fields: ["makerId"] },
      { fields: ["zpTransId"] }, // index để callback lookup nhanh
    ],
  },
);

module.exports = CustomOrder;
