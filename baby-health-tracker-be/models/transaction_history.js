const mongoose = require('mongoose');
const point_package = require('./point_package');
const transactionHistorySchema = new mongoose.Schema({
    point_package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PointPackage', required: true },
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    transaction_date: { type: Date, default: Date.now },
    points: { type: Number, required: true },
    amount: { type: Number, required: true },
    receiver: { type: String, required: true },
    payment_method: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    description: { type: String },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TransactionHistory', transactionHistorySchema);