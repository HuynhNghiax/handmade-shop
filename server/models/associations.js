const User = require("./User");
const Order = require("./Order");
const CustomOrder = require("./CustomOrder");
const Bid = require("./Bid");
const MakerProfile = require("./MakerProfile");
const Review = require("./Review");
const Product = require("./Product");

//  User - Order
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

//  User - CustomOrder
User.hasMany(CustomOrder, { foreignKey: "userId", as: "CustomOrders" });
CustomOrder.belongsTo(User, { foreignKey: "userId", as: "Customer" });

// Thợ thực hiện đơn (makerId)
User.hasMany(CustomOrder, { foreignKey: "makerId", as: "AssignedOrders" });
CustomOrder.belongsTo(User, { foreignKey: "makerId", as: "Maker" });

//  User - MakerProfile (1-1)
User.hasOne(MakerProfile, { foreignKey: "userId", as: "MakerProfile" });
MakerProfile.belongsTo(User, { foreignKey: "userId", as: "User" });

//  User - Bid
User.hasMany(Bid, { foreignKey: "makerId", as: "SentBids" });
Bid.belongsTo(User, { foreignKey: "makerId", as: "MakerUser" });

//  CustomOrder - Bid
CustomOrder.hasMany(Bid, { foreignKey: "customOrderId", as: "Bids" });
Bid.belongsTo(CustomOrder, { foreignKey: "customOrderId", as: "CustomOrder" });

// Bid được chấp nhận (acceptedBidId)
CustomOrder.belongsTo(Bid, {
  foreignKey: "acceptedBidId",
  as: "AcceptedBid",
  constraints: false,
});

//  MakerProfile - Bid
MakerProfile.hasMany(Bid, { foreignKey: "makerId", as: "MakerBids" });
Bid.belongsTo(MakerProfile, {
  foreignKey: "makerId",
  as: "MakerProfile",
  constraints: false,
});

//  Review relationships
CustomOrder.hasOne(Review, { foreignKey: "customOrderId", as: "Review" });
Review.belongsTo(CustomOrder, {
  foreignKey: "customOrderId",
  as: "CustomOrder",
});

MakerProfile.hasMany(Review, { foreignKey: "makerId", as: "Reviews" });
Review.belongsTo(MakerProfile, {
  foreignKey: "makerId",
  as: "MakerProfile",
  constraints: false,
});

// Reviewer (khách hàng đánh giá)
User.hasMany(Review, { foreignKey: "reviewerId", as: "GivenReviews" });
Review.belongsTo(User, { foreignKey: "reviewerId", as: "Reviewer" });

const ProductReview = require("./ProductReview");

// Product - ProductReview
Product.hasMany(ProductReview, { foreignKey: "productId", as: "Reviews" });
ProductReview.belongsTo(Product, { foreignKey: "productId", as: "Product" });

// User - ProductReview
User.hasMany(ProductReview, { foreignKey: "userId", as: "ProductReviews" });
ProductReview.belongsTo(User, { foreignKey: "userId", as: "User" });

module.exports = { User, Order, CustomOrder, Bid, MakerProfile, Review, ProductReview };
