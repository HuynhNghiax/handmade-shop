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
  },
  { timestamps: true },
);

module.exports = CustomOrder;
