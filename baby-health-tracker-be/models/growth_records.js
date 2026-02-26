const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const growthRecordSchema = new Schema({
    baby_id: { type: Schema.Types.ObjectId, ref: 'Babies', required: true },
    head_size: { type: Number, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    record_date: { type: Date, required: true },
});

const GrowthRecord = mongoose.model('GrowthRecord', growthRecordSchema);
module.exports = GrowthRecord;
