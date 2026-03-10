const Parent = require('../models/parents');

const createParent = async (parentData) => {
    const parent = new Parent(parentData);
    return await parent.save();
};
const findParentById = async (id) => {
    return await Parent.findById(id);
};

const updateParentById = async (parentId, updateData) => {
    return await Parent.findByIdAndUpdate(parentId, updateData, { new: true });
};

const listParentsByIds = async (parentIds) => {
    return await Parent.find({ _id: { $in: parentIds } });
};

const deleteParent = async (parentId) => {
    return await Parent.findByIdAndDelete(parentId);
};

const addWalletPoints = async (parentId, points) => {
    return await Parent.findByIdAndUpdate(
        parentId,
        { $inc: { wallet_points: points } },
        { new: true }
    );
};

const deductWalletPoints = async (parentId, points) => {
    return await Parent.findOneAndUpdate(
        {
            _id: parentId,
            wallet_points: { $gte: points },
        },
        { $inc: { wallet_points: -points } },
        { new: true }
    );
};

module.exports = {
    createParent,
    findParentById,
    updateParentById,
    listParentsByIds,
    deleteParent,
    addWalletPoints,
    deductWalletPoints,
};