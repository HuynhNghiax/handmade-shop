const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('avatar');
        if (rawValue && rawValue.startsWith('/uploads')) {
          return `http://localhost:5000${rawValue}`;
        }
        return rawValue;
      }
    },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: true },
    googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    isMaker: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true },
);

module.exports = User;
