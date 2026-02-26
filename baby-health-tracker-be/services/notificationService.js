const Notifications = require('../models/notifications');

const createReminder = async (parentId, content) => {
    const reminder = new Notifications({
        parent_id: parentId,
        type: 'vaccination_reminder',
        content,
        is_read: false,
    });

    return await reminder.save();
};

const listRemindersByParentId = async (parentId) => {
    return await Notifications.find({ parent_id: parentId, type: 'vaccination_reminder' })
        .sort({ createdAt: -1 });
};

const listSystemNotificationsByParentId = async (parentId) => {
    return await Notifications.find({ parent_id: parentId, type: 'system' })
        .sort({ createdAt: -1 });
};

const findNotificationById = async (notificationId) => {
    return await Notifications.findById(notificationId);
};

module.exports = {
    createReminder,
    listRemindersByParentId,
    listSystemNotificationsByParentId,
    findNotificationById,
};
