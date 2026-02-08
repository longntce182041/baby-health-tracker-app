const mongoose = require('mongoose');
const { create } = require('./accounts');
const Schema = mongoose.Schema;

const doctorsSchema = new Schema({
    full_name: { type: String, required: true },
    avatar_url: { type: String, required: false },
    created_at: { type: Date, default: Date.now },
});

const Doctors = mongoose.model('Doctors', doctorsSchema);
module.exports = Doctors;