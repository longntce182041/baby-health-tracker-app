const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
    vaccine_name: { type: String, required: true },
    dose_number: { type: Number, required: true },
    price: { type: Number, required: true },
    location: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HospitalBranch' }]
}, { timestamps: true });

const Vaccination = mongoose.model('Vaccination', vaccinationSchema);
module.exports = Vaccination;