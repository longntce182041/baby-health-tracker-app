const Conversation = require('../models/conversations');

const findOrCreateConversation = async (parentId, doctorId, babyId) => {
    let conversation = await Conversation.findOne({
        parent_id: parentId,
        doctor_id: doctorId,
        baby_id: babyId,
    });

    if (!conversation) {
        conversation = new Conversation({
            parent_id: parentId,
            doctor_id: doctorId,
            baby_id: babyId,
            messages: [],
            status: true,
        });
        await conversation.save();
    }

    return conversation;
};

const addMessageToConversation = async (conversationId, message) => {
    return await Conversation.findByIdAndUpdate(
        conversationId,
        { $push: { messages: message } },
        { new: true }
    );
};

module.exports = {
    findOrCreateConversation,
    addMessageToConversation,
};
