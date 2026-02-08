const Accounts = require('../models/accounts');

async function create(data) {
    return Accounts.create(data);
}

async function getAll(query) {
    return Accounts.find(query);
}

async function getById(id) {
    return Accounts.findById(id);
}

async function updateById(id, data) {
    return Accounts.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return Accounts.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
