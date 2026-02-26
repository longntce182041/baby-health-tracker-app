const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const healthLogSchema = new Schema({
    baby_id: { type: Schema.Types.ObjectId, ref: 'Babies', required: true },
    log_date: { type: Date, default: Date.now, required: true },
    tempurature: { type: Number, required: true },
    sleep: { type: Number, required: true },
    image_urls: [{ type: String }],
    symptoms: [{ type: String }],
    activities: [{ type: String }],
    eating: { type: String },
    mood: { type: String },
    notes: { type: String },
});

const HealthLog = mongoose.model('HealthLog', healthLogSchema);
module.exports = HealthLog;
