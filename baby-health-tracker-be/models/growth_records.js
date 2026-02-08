const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const growthRecordsSchema = new Schema({
    baby_id: { type: Schema.Types.ObjectId, ref: 'Babies', required: true },
    head_size: { type: Number, required: true }, // in cm
    weight: { type: Number, required: true }, // in kg
    height: { type: Number, required: true }, // in cm
    record_date: { type: Date, required: true },
});

const GrowthRecords = mongoose.model('GrowthRecords', growthRecordsSchema);
module.exports = GrowthRecords;