const growthRecordsService = require('../services/growthRecordsService');

async function create(req, res) {
    try {
        const item = await growthRecordsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create growth record', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await growthRecordsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch growth records', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await growthRecordsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Growth record not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch growth record', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await growthRecordsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Growth record not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update growth record', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await growthRecordsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Growth record not found' });
        }
        res.json({ message: 'Growth record deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete growth record', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
