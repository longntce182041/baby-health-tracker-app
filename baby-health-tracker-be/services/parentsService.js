const Parents = require('../models/parents');

async function create(data) {
    return Parents.create(data);
}

async function getAll(query) {
    return Parents.find(query);
}

async function getById(id) {
    return Parents.findById(id);
}

async function updateById(id, data) {
    return Parents.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return Parents.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
