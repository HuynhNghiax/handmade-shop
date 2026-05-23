const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Bid = sequelize.define(
  "Bid",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customOrderId: { type: DataTypes.INTEGER, allowNull: false },
    makerId: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    contactInfo: { type: DataTypes.STRING, allowNull: false },
    seenByOwner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true },
);

module.exports = Bid;
