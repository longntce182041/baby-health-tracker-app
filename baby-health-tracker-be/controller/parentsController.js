const parentsService = require('../services/parentsService');

async function create(req, res) {
    try {
        const item = await parentsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create parent', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await parentsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch parents', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await parentsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch parent', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await parentsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update parent', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await parentsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.json({ message: 'Parent deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete parent', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
