const VaccineSchedules = require('../models/vaccine_chedules');

async function create(data) {
    return VaccineSchedules.create(data);
}

async function getAll(query) {
    return VaccineSchedules.find(query);
}

async function getById(id) {
    return VaccineSchedules.findById(id);
}

async function updateById(id, data) {
    return VaccineSchedules.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return VaccineSchedules.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
