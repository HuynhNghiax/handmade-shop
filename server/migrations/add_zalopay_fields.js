/**
 * Migration: Thêm ZaloPay fields vào bảng CustomOrders
 * ======================================================
 * Chạy file này một lần để alter table, hoặc thêm trực tiếp vào model CustomOrder.js
 *
 * Cách dùng: node server/migrations/add_zalopay_fields.js
 */

require("dotenv").config({ path: __dirname + "/../.env" });
const sequelize = require("../config/db");
const { QueryInterface, DataTypes } = require("sequelize");

const run = async () => {
  const qi = sequelize.getQueryInterface();
  try {
    await qi.addColumn("CustomOrders", "zpTransId", {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "app_trans_id gửi cho ZaloPay, dùng để đối soát callback",
    });
    console.log("Added zpTransId");
  } catch (e) {
    console.log("zpTransId already exists or error:", e.message);
  }

  try {
    await qi.addColumn("CustomOrders", "paymentStatus", {
      type: DataTypes.ENUM("unpaid", "paid", "refunded"),
      defaultValue: "unpaid",
      allowNull: false,
      comment: "Trạng thái thanh toán ZaloPay",
    });
    console.log("Added paymentStatus");
  } catch (e) {
    console.log("paymentStatus already exists or error:", e.message);
  }

  try {
    await qi.addColumn("CustomOrders", "zpPaidAt", {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Thời điểm ZaloPay xác nhận thanh toán thành công",
    });
    console.log("Added zpPaidAt");
  } catch (e) {
    console.log("zpPaidAt already exists or error:", e.message);
  }

  await sequelize.close();
  console.log("Migration done!");
};

run().catch(console.error);
