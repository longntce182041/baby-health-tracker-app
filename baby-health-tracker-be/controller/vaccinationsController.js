const vaccinationsService = require('../services/vaccinationsService');

async function create(req, res) {
    try {
        const item = await vaccinationsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create vaccination', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await vaccinationsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vaccinations', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await vaccinationsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Vaccination not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vaccination', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await vaccinationsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Vaccination not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update vaccination', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await vaccinationsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Vaccination not found' });
        }
        res.json({ message: 'Vaccination deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete vaccination', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
