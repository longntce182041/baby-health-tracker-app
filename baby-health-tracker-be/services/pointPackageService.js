const PointPackage = require('../models/point_package');

const createPointPackage = async (packageData) => {
    const pointPackage = new PointPackage(packageData);
    return await pointPackage.save();
};

const getAllPointPackages = async () => {
    return await PointPackage.find().sort({ points: 1 });
};

const getPointPackageById = async (id) => {
    return await PointPackage.findById(id);
};

const updatePointPackageById = async (id, updateData) => {
    return await PointPackage.findByIdAndUpdate(id, updateData, { new: true });
};

const deletePointPackageById = async (id) => {
    return await PointPackage.findByIdAndDelete(id);
};

module.exports = {
    createPointPackage,
    getAllPointPackages,
    getPointPackageById,
    updatePointPackageById,
    deletePointPackageById,
};
