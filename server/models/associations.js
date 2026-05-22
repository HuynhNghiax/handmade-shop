const User = require('./User');
const Order = require('./Order');
const CustomOrder = require('./CustomOrder');
const Bid = require('./Bid');

// User and Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// User and CustomOrder
User.hasMany(CustomOrder, { foreignKey: 'userId' });
CustomOrder.belongsTo(User, { foreignKey: 'userId' });

// CustomOrder and Bid
CustomOrder.hasMany(Bid, { foreignKey: 'customOrderId' });
Bid.belongsTo(CustomOrder, { foreignKey: 'customOrderId' });

// User and Bid (User is the maker)
User.hasMany(Bid, { foreignKey: 'makerId' });
Bid.belongsTo(User, { foreignKey: 'makerId' });

module.exports = { User, Order, CustomOrder, Bid };
