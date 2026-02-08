const healthLogsService = require('../services/healthLogsService');

async function create(req, res) {
    try {
        const item = await healthLogsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create health log', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await healthLogsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch health logs', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await healthLogsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Health log not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch health log', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await healthLogsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Health log not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update health log', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await healthLogsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Health log not found' });
        }
        res.json({ message: 'Health log deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete health log', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
