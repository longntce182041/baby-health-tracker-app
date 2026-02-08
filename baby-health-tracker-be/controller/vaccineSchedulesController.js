const vaccineSchedulesService = require('../services/vaccineSchedulesService');

async function create(req, res) {
    try {
        const item = await vaccineSchedulesService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create vaccine schedule', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await vaccineSchedulesService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vaccine schedules', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await vaccineSchedulesService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Vaccine schedule not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vaccine schedule', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await vaccineSchedulesService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Vaccine schedule not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update vaccine schedule', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await vaccineSchedulesService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Vaccine schedule not found' });
        }
        res.json({ message: 'Vaccine schedule deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete vaccine schedule', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
