const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
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
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
    created_at: { type: Date, default: Date.now }
});

const Reviews = mongoose.model('Reviews', reviewSchema);
module.exports = Reviews;