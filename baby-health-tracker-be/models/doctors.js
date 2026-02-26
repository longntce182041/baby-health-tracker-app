const mongoose = require('mongoose');
const { create } = require('./accounts');
const Schema = mongoose.Schema;

const doctorsSchema = new Schema({
    full_name: { type: String, },
    avatar_url: { type: String, },
    specialty: { type: String, },
    created_at: { type: Date, default: Date.now },
    experience: [
        {
            certificate_name: { type: String, },
            certificate_url: { type: String, },
            created_at: { type: Date, default: Date.now },
        }
    ],
});

const Doctors = mongoose.model('Doctors', doctorsSchema);
module.exports = Doctors;