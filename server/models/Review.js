const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Review = sequelize.define(
  "Review",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customOrderId: { type: DataTypes.INTEGER, allowNull: false },
    reviewerId: { type: DataTypes.INTEGER, allowNull: false },
    makerId: { type: DataTypes.INTEGER, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["customOrderId"] }],
  },
);

module.exports = Review;
