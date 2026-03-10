const mongoose = require('mongoose');
const config = require('./Config');

const connectDB = async () => {
    const mongoUri = config.MONGODB_URI;

    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(mongoUri, {
            autoIndex: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
