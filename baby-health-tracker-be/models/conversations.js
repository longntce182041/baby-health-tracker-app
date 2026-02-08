const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Parents',
        required: true
    },
    doctor_id: {
        type: Schema.Types.ObjectId,
        ref: 'Doctors',
        required: true
    },
    messages: [
        {
            sender: { type: String, required: true, enum: ['parent', 'doctor'] },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    created_at: { type: Date, default: Date.now }
});

const Conversations = mongoose.model('Conversations', conversationSchema);
module.exports = Conversations;