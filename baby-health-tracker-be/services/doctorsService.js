const Doctors = require('../models/doctors');

async function create(data) {
    return Doctors.create(data);
}

async function getAll(query) {
    return Doctors.find(query);
}

async function getById(id) {
    return Doctors.findById(id);
}

async function updateById(id, data) {
    return Doctors.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return Doctors.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
