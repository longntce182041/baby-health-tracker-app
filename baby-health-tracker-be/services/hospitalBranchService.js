const HospitalBranch = require('../models/hospital_branches');

const createBranch = async (branchData) => {
    const branch = new HospitalBranch(branchData);
    return await branch.save();
};

const listBranches = async () => {
    return await HospitalBranch.find().sort({ branch_name: 1, createdAt: -1 });
};

const findBranchById = async (branchId) => {
    return await HospitalBranch.findById(branchId);
};

const findBranchesByIds = async (branchIds) => {
    return await HospitalBranch.find({ _id: { $in: branchIds } });
};

const updateBranchById = async (branchId, updateData) => {
    return await HospitalBranch.findByIdAndUpdate(branchId, updateData, { new: true });
};

const deleteBranchById = async (branchId) => {
    return await HospitalBranch.findByIdAndDelete(branchId);
};

module.exports = {
    createBranch,
    listBranches,
    findBranchById,
    findBranchesByIds,
    updateBranchById,
    deleteBranchById,
};
