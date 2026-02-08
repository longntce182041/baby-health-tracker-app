const Reviews = require('../models/reviews');

async function create(data) {
    return Reviews.create(data);
}

async function getAll(query) {
    return Reviews.find(query);
}

async function getById(id) {
    return Reviews.findById(id);
}

async function updateById(id, data) {
    return Reviews.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return Reviews.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
