const Babies = require('../models/babies');

async function create(data) {
    return Babies.create(data);
}

async function getAll(query) {
    return Babies.find(query);
}

async function getById(id) {
    return Babies.findById(id);
}

async function updateById(id, data) {
    return Babies.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return Babies.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
