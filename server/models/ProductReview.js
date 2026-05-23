const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProductReview = sequelize.define(
  "ProductReview",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
    adminReply: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    timestamps: true,
  }
);

module.exports = ProductReview;
