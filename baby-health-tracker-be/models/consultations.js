const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationsSchema = new Schema({
    parent_id: { type: Schema.Types.ObjectId, ref: 'Parents', required: true },
    baby_id: { type: Schema.Types.ObjectId, ref: 'Babies', required: true },
    doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctors', required: true },
    schedule_id: { type: Schema.Types.ObjectId, ref: 'DoctorSchedules', required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'canceled'], default: 'scheduled' },
    consultation_time: { type: Date, required: true },
    notes: { type: String },
}, { timestamps: true });

const Consultations = mongoose.model('Consultations', conversationsSchema);
module.exports = Consultations;