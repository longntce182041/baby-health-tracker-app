const HealthLogs = require('../models/health_logs');

async function create(data) {
    return HealthLogs.create(data);
}

async function getAll(query) {
    return HealthLogs.find(query);
}

async function getById(id) {
    return HealthLogs.findById(id);
}

async function updateById(id, data) {
    return HealthLogs.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return HealthLogs.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
