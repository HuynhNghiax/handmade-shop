const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    products: {
        type: DataTypes.JSONB, // Lưu mảng các sản phẩm đã mua
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "Chờ xác nhận"
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: "COD"
    },
    paymentStatus: {
        type: DataTypes.STRING,
        defaultValue: "pending"
    },
    zpTransId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    zpPaidAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Order;