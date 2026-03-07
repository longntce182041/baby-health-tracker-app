const mongoose = require("mongoose");
const point_package = require("./point_package");
const transactionHistorySchema = new mongoose.Schema({
  point_package_id: {
    type: String, // Changed to String to support both package codes (p1, p2, p3) and ObjectIds
    required: true,
  },
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  transaction_date: { type: Date, default: Date.now },
  points: { type: Number, required: true },
  amount: { type: Number, required: true },
  receiver: { type: String, required: true },
  payment_method: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  description: { type: String },

  // PayOS specific fields
  payos_order_code: { type: Number, unique: true, sparse: true },
  payos_transaction_id: { type: String },
  payos_payment_link: { type: String },
  payos_qr_code: { type: String },

  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TransactionHistory", transactionHistorySchema);
