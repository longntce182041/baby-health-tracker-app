const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const babiesSchema = new Schema({
    parent_ids: [{ type: Schema.Types.ObjectId, ref: 'Parents', required: true }],
    full_name: { type: String, required: true },
    avatar_url: { type: String, required: false },
    day_of_birth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    note: [
        {
            content: { type: String },
            created_at: { type: Date, default: Date.now },
        },
    ],
    code: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
});

const Babies = mongoose.model('Babies', babiesSchema);
module.exports = Babies;