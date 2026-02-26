const Notifications = require('../models/notifications');

const createReminder = async (parentId, content) => {
    const reminder = new Notifications({
        parent_id: parentId,
        type: 'reminder',
        content,
        is_read: false,
    });

    return await reminder.save();
};

const listRemindersByParentId = async (parentId) => {
    return await Notifications.find({ parent_id: parentId, type: 'reminder' })
        .sort({ createdAt: -1 });
};

module.exports = {
    createReminder,
    listRemindersByParentId,
};
