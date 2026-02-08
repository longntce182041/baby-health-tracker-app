const GrowthRecords = require('../models/growth_records');

async function create(data) {
    return GrowthRecords.create(data);
}

async function getAll(query) {
    return GrowthRecords.find(query);
}

async function getById(id) {
    return GrowthRecords.findById(id);
}

async function updateById(id, data) {
    return GrowthRecords.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return GrowthRecords.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
