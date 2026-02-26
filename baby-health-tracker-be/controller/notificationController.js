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

module.exports = {
    listVaccinationReminders,
};
