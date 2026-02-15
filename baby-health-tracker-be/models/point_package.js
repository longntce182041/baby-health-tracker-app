const mongoose = require('mongoose');

const pointPackageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    points: { type: Number, required: true },
    price: { type: Number, required: true },
});

module.exports = mongoose.model('PointPackage', pointPackageSchema);