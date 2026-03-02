const Vaccination = require('../models/vaccinations');

const createVaccination = async (vaccinationData) => {
    const vaccination = new Vaccination(vaccinationData);
    return await vaccination.save();
};

const listVaccinations = async () => {
    return await Vaccination.find().sort({ vaccine_name: 1, dose_number: 1 });
};

const findVaccinationById = async (vaccinationId) => {
    return await Vaccination.findById(vaccinationId);
};

const addLocations = async (vaccinationId, locations) => {
    return await Vaccination.findByIdAndUpdate(
        vaccinationId,
        { $push: { location: { $each: locations } } },
        { new: true }
    );
};

const removeLocationsByIds = async (vaccinationId, locationIds) => {
    return await Vaccination.findByIdAndUpdate(
        vaccinationId,
        { $pull: { location: { _id: { $in: locationIds } } } },
        { new: true }
    );
};

module.exports = {
    createVaccination,
    findVaccinationById,
    listVaccinations,
    addLocations,
    removeLocationsByIds,
};
