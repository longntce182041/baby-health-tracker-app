const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Parents', required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctors', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;