const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailOtpsSchema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['register', 'reset'], required: true },
    expires_at: { type: Date, required: true },
    used: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
});

const EmailOtp = mongoose.model('EmailOtp', emailOtpsSchema);
module.exports = EmailOtp;