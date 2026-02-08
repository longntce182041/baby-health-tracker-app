const Vaccinations = require('../models/vaccinations');

async function create(data) {
    return Vaccinations.create(data);
}

async function getAll(query) {
    return Vaccinations.find(query);
}

async function getById(id) {
    return Vaccinations.findById(id);
}

async function updateById(id, data) {
    return Vaccinations.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return Vaccinations.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
