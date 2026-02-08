const doctorSchedulesService = require('../services/doctorSchedulesService');

async function create(req, res) {
    try {
        const item = await doctorSchedulesService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create doctor schedule', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await doctorSchedulesService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctor schedules', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await doctorSchedulesService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Doctor schedule not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctor schedule', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await doctorSchedulesService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Doctor schedule not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update doctor schedule', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await doctorSchedulesService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Doctor schedule not found' });
        }
        res.json({ message: 'Doctor schedule deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete doctor schedule', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
