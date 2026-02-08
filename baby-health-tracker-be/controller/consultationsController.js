const consultationsService = require('../services/consultationsService');

async function create(req, res) {
    try {
        const item = await consultationsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create consultation', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await consultationsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch consultations', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await consultationsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch consultation', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await consultationsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update consultation', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await consultationsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        res.json({ message: 'Consultation deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete consultation', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
