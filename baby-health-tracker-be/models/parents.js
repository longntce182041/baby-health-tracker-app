const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const parentsSchema = new Schema({
    full_name: { type: String, required: true },
    avatar_url: { type: String, required: false },
    wallet_points: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
});

const Parents = mongoose.model('Parents', parentsSchema);
module.exports = Parents;