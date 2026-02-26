const notificationService = require('../services/notificationService');

const listVaccinationReminders = async (req, res) => {
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const reminders = await notificationService.listRemindersByParentId(parentId);
        return res.status(200).json({ message: 'Vaccination reminders fetched', data: reminders });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const listSystemNotifications = async (req, res) => {
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const notifications = await notificationService.listSystemNotificationsByParentId(parentId);
        return res.status(200).json({ message: 'System notifications fetched', data: notifications });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getNotificationDetail = async (req, res) => {
    const { id } = req.params;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const notification = await notificationService.findNotificationById(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.parent_id.toString() !== parentId.toString()) {
            return res.status(403).json({ message: 'Not allowed to view this notification' });
        }

        return res.status(200).json({ message: 'Notification detail fetched', data: notification });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    listVaccinationReminders,
    listSystemNotifications,
    getNotificationDetail,
};
