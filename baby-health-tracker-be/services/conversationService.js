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

const createConversationWithConsultation = async (parentId, doctorId, babyId, consultationId) => {
    const conversation = new Conversation({
        parent_id: parentId,
        doctor_id: doctorId,
        baby_id: babyId,
        consultation_id: consultationId,
        messages: [],
        status: true,
    });
    return await conversation.save();
};

const findConversationById = async (conversationId) => {
    return await Conversation.findById(conversationId);
};

const findConversationByconsultationId = async (consultationId) => {
    return await Conversation.findOne({ consultation_id: consultationId });
};

const findConversationByParentAndDoctor = async (parentId, doctorId) => {
    return await Conversation.findOne({
        parent_id: parentId,
        doctor_id: doctorId,
    });
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
    createConversationWithConsultation,
    findConversationById,
    findConversationByconsultationId,
    findConversationByParentAndDoctor,
    addMessageToConversation,
};
