const Notifications = require('../models/notifications');

async function create(data) {
    return Notifications.create(data);
}

async function getAll(query) {
    return Notifications.find(query);
}

async function getById(id) {
    return Notifications.findById(id);
}

async function updateById(id, data) {
    return Notifications.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return Notifications.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
