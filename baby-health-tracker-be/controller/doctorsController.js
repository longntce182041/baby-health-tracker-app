const doctorsService = require('../services/doctorsService');

async function create(req, res) {
    try {
        const item = await doctorsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create doctor', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await doctorsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await doctorsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctor', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await doctorsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update doctor', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await doctorsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ message: 'Doctor deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete doctor', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
