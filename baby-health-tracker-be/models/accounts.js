const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountsSchema = new Schema({
    parent_id: { type: Schema.Types.ObjectId, ref: 'Parents' },
    doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctors' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
    role: { type: String, enum: ['doctor', 'parent'], required: true },
    created_at: { type: Date, default: Date.now },
});

const Accounts = mongoose.model('Accounts', accountsSchema);
module.exports = Accounts;