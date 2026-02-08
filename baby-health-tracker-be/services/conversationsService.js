const Conversations = require('../models/conversations');

async function create(data) {
    return Conversations.create(data);
}

async function getAll(query) {
    return Conversations.find(query);
}

async function getById(id) {
    return Conversations.findById(id);
}

async function updateById(id, data) {
    return Conversations.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteById(id) {
    return Conversations.findByIdAndDelete(id);
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
