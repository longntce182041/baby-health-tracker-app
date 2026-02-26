const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
    vaccine_name: { type: String, required: true },
    dose_number: { type: Number, required: true },
    price: { type: Number, required: true },
    location: [
        {
            branch_name: { type: String, required: true },
            address: { type: String, required: true },
        }
    ]
}, { timestamps: true });

const Vaccination = mongoose.model('Vaccination', vaccinationSchema);
module.exports = Vaccination;