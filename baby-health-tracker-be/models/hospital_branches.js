const mongoose = require('mongoose');

const hospitalBranchSchema = new mongoose.Schema({
    branch_name: { type: String, required: true },
    address: { type: String, required: true },
}, { timestamps: true });

const HospitalBranch = mongoose.model('HospitalBranch', hospitalBranchSchema);
module.exports = HospitalBranch;
