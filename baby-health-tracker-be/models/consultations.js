const mongoose = require('mongoose');
const { create } = require('./doctor_schedules');
const Schema = mongoose.Schema;

const consultationSchema = new Schema({
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Parents',
        required: true
    },
    baby_id: {
        type: Schema.Types.ObjectId,
        ref: 'Babies',
        required: true
    },
    doctor_id: {
        type: Schema.Types.ObjectId,
        ref: 'Doctors',
        required: true
    },
    schedule_id: {
        type: Schema.Types.ObjectId,
        ref: 'DoctorSchedules',
        required: true
    },
    status: { type: String, required: true, enum: ['scheduled', 'completed', 'canceled'] },
    created_at: { type: Date, default: Date.now },
});

const Consultations = mongoose.model('Consultations', consultationSchema);
module.exports = Consultations;