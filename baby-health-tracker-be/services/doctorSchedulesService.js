const DoctorSchedules = require('../models/doctor_schedules');

async function create(data) {
    return DoctorSchedules.create(data);
}

async function getAll(query) {
    return DoctorSchedules.find(query);
}

async function getById(id) {
    return DoctorSchedules.findById(id);
}

async function updateById(id, data) {
    return DoctorSchedules.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return DoctorSchedules.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
