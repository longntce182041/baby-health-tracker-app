const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationsSchema = new Schema({
    baby_id: { type: Schema.Types.ObjectId, ref: 'Babies', required: true },
    doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctors', required: true },
    parent_id: { type: Schema.Types.ObjectId, ref: 'Parents', required: true },
    messages: [
        {
            sender: { type: String, enum: ['doctor', 'parent'], required: true },
            content: { type: String, required: true },
            status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    status: { type: Boolean, default: true },
});

const Conversations = mongoose.model('Conversations', conversationsSchema);
module.exports = Conversations;