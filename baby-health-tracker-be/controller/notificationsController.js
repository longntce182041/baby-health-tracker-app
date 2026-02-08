const notificationsService = require('../services/notificationsService');

async function create(req, res) {
    try {
        const item = await notificationsService.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create notification', error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const items = await notificationsService.getAll(req.query || {});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
}

async function getById(req, res) {
    try {
        const item = await notificationsService.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notification', error: error.message });
    }
}

async function updateById(req, res) {
    try {
        const item = await notificationsService.updateById(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
}

async function deleteById(req, res) {
    try {
        const item = await notificationsService.deleteById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById
};
