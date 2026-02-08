const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vaccineScheduleSchema = new Schema({
    baby_id: { type: Schema.Types.ObjectId, ref: 'Babies', required: true },
    vaccine_id: { type: Schema.Types.ObjectId, ref: 'Vaccinations', required: true },
    injection_date: { type: Date, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'missed'], default: 'scheduled' }
});

module.exports = mongoose.model('VaccineSchedules', vaccineScheduleSchema);