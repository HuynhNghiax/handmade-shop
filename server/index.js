require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");

const sequelize = require("./config/db");
const configurePassport = require("./config/passport");
require("./models/associations");

// ROUTES
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const userRoutes = require("./routes/user");
const logRoutes = require("./routes/log");
const customOrderRoutes = require("./routes/customOrder");
const makerRoutes = require("./routes/maker");
const reviewRoutes = require("./routes/review");

const app = express();

// MIDDLEWARE
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// PASSPORT
configurePassport();
app.use(passport.initialize());

// GẮN ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/custom-orders", customOrderRoutes);
app.use("/api/makers", makerRoutes);
app.use("/api/reviews", reviewRoutes);

// HEALTH CHECK
app.get("/health", (req, res) => res.json({ status: "ok", ts: new Date() }));

// KHỞI ĐỘNG
const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced (alter)");
    app.listen(PORT, () => {
      console.log(`PinkyCrafts server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Kết nối database thất bại:", err);
  });
