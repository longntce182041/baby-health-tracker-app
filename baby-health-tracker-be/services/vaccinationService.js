const Vaccination = require('../models/vaccinations');

const createVaccination = async (vaccinationData) => {
    const vaccination = new Vaccination(vaccinationData);
    return await vaccination.save();
};

const listVaccinations = async () => {
    return await Vaccination.find()
        .populate('location')
        .sort({ vaccine_name: 1, dose_number: 1 });
};

const findVaccinationById = async (vaccinationId) => {
    return await Vaccination.findById(vaccinationId).populate('location');
};

const addLocations = async (vaccinationId, branchIds) => {
    return await Vaccination.findByIdAndUpdate(
        vaccinationId,
        { $addToSet: { location: { $each: branchIds } } },
        { new: true }
    ).populate('location');
};

const removeLocationsByIds = async (vaccinationId, branchIds) => {
    return await Vaccination.findByIdAndUpdate(
        vaccinationId,
        { $pull: { location: { $in: branchIds } } },
        { new: true }
    ).populate('location');
};

const updateVaccinationById = async (vaccinationId, updateData) => {
    return await Vaccination.findByIdAndUpdate(
        vaccinationId,
        updateData,
        { new: true }
    ).populate('location');
};

const deleteVaccinationById = async (vaccinationId) => {
    return await Vaccination.findByIdAndDelete(vaccinationId);
};

module.exports = {
    createVaccination,
    findVaccinationById,
    listVaccinations,
    addLocations,
    removeLocationsByIds,
    updateVaccinationById,
    deleteVaccinationById,
};
