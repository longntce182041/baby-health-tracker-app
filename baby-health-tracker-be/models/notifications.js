const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationsSchema = new Schema({
    parent_id: { type: Schema.Types.ObjectId, ref: 'Parents', required: true },
    type: { type: String, enum: ['consultation', 'reminder'], required: true },
    content: { type: String, required: true },
    is_read: { type: Boolean, default: false },
}, { timestamps: true });

const Notifications = mongoose.model('Notifications', conversationsSchema);
module.exports = Notifications;