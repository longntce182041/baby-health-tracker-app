const Parent = require('../models/parents');

const createParent = async (parentData) => {
    const parent = new Parent(parentData);
    return await parent.save();
}
const findParentById = async (id) => {
    return await Parent.findById(id);
}

const updateParentById = async (parentId, updateData) => {
    return await Parent.findByIdAndUpdate(parentId, updateData, { new: true });
}

const deleteParent = async (parentId) => {
    return await Parent.findByIdAndDelete(parentId);
}

module.exports = {
    createParent,
    findParentById,
    updateParentById,
    deleteParent
}