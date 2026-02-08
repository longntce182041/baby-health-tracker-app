const babiesService = require('../services/babiesService');

async function create(req, res) {
    try {
        const item = await babiesService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create baby', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await babiesService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch babies', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await babiesService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Baby not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch baby', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await babiesService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Baby not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update baby', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await babiesService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Baby not found' });
        }
        res.json({ message: 'Baby deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete baby', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
