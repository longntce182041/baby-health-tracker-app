const Conversation = require('../models/conversations');
const Consultation = require('../models/consultations');

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
    return await Conversation.findOne({
        consultation_id: consultationId,
        status: true,
    });
};

const findConversationByParentAndDoctor = async (parentId, doctorId) => {
    const inProgressConsultation = await Consultation.findOne({
        parent_id: parentId,
        doctor_id: doctorId,
        status: 'in_progress',
    }).sort({ consultation_time: -1, createdAt: -1 });

    if (inProgressConsultation) {
        const conversation = await Conversation.findOne({
            parent_id: parentId,
            doctor_id: doctorId,
            consultation_id: inProgressConsultation._id,
            status: true,
        }).sort({ _id: -1 });

        if (conversation) {
            return conversation;
        }
    }

    const waitingConsultation = await Consultation.findOne({
        parent_id: parentId,
        doctor_id: doctorId,
        status: 'waiting',
    }).sort({ consultation_time: -1, createdAt: -1 });

    if (waitingConsultation) {
        const conversation = await Conversation.findOne({
            parent_id: parentId,
            doctor_id: doctorId,
            consultation_id: waitingConsultation._id,
            status: true,
        }).sort({ _id: -1 });

        if (conversation) {
            return conversation;
        }
    }

    return await Conversation.findOne({
        parent_id: parentId,
        doctor_id: doctorId,
        status: true,
    }).sort({ _id: -1 });
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
