const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CustomOrder = sequelize.define('CustomOrder', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING },
    budget: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING, defaultValue: "Đang tìm thợ" }
}, { timestamps: true });

module.exports = CustomOrder;