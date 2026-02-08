const conversationsService = require('../services/conversationsService');

async function create(req, res) {
    try {
        const item = await conversationsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create conversation', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await conversationsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await conversationsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch conversation', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await conversationsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update conversation', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await conversationsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        res.json({ message: 'Conversation deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete conversation', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
