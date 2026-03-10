require("dotenv").config();

module.exports = {
    // Server
    PORT: process.env.PORT || 3000,

    // MongoDB
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/baby_health_tracker",

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || "12345-67890-09876-54321",

    // Email (Gmail SMTP)
    EMAIL_USER: process.env.EMAIL_USER || "betiny10092005@gmail.com",
    EMAIL_PASS: process.env.EMAIL_PASS || "srii tkdr scdj jxpo",

    // PayOS
    PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
    PAYOS_API_KEY: process.env.PAYOS_API_KEY,
    PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,

    // Payment Redirect URLs
    PAYMENT_SUCCESS_URL: process.env.PAYMENT_SUCCESS_URL,
    PAYMENT_CANCEL_URL: process.env.PAYMENT_CANCEL_URL,
};
