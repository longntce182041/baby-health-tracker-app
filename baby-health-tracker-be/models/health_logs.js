const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const healthLogsSchema = new Schema({
    baby_id: { type: Schema.Types.ObjectId, ref: 'Babies', required: true },
    log_date: { type: Date, required: true },
    tempurature: { type: Number, required: true },
    sleep: { type: Number, required: true }, // in hours
    image_urls: { type: [String], required: false },
    symptoms: { type: [String], required: false },
    activities: { type: [String], required: false },
    eating: { type: String, required: false },
    mood: { type: String, enum: ['happy', 'normal', 'sad'], required: false },
    notes: { type: String, required: false },
});

const HealthLogs = mongoose.model('HealthLogs', healthLogsSchema);
module.exports = HealthLogs;