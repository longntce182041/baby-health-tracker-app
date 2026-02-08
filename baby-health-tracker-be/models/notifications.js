const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Parents',
        required: true
    },
    type: { type: String, required: true, enum: ['info', 'warning', 'alert'] },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const Notifications = mongoose.model('Notifications', notificationSchema);
module.exports = Notifications;