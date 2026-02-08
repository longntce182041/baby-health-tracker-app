const Consultations = require('../models/consultations');

async function create(data) {
    return Consultations.create(data);
}

async function getAll(query) {
    return Consultations.find(query);
}

async function getById(id) {
    return Consultations.findById(id);
}

async function updateById(id, data) {
    return Consultations.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return Consultations.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
