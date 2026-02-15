const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri =
        process.env.MONGODB_URI ||
        'mongodb://127.0.0.1:27017/baby_health_tracker';

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
