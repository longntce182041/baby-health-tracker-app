const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
    baby_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Baby', required: true },
    vaccine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vaccination', required: true },
    injection_date: { type: Date, required: true },
    location: {
        branch_name: { type: String, required: true },
        address: { type: String, required: true },
    },
    notes: [
        {
            content: { type: String, required: true },
            created_at: { type: Date, default: Date.now },
        },
    ],
    status: { type: String, enum: ['scheduled', 'completed', 'missed'], default: 'scheduled' },
}, { timestamps: true });

const VaccineSchedule = mongoose.model('VaccineSchedule', vaccinationSchema);

module.exports = VaccineSchedule;