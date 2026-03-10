const babyService = require('../services/babyService');
const doctorService = require('../services/doctorService');
const conversationService = require('../services/conversationService');
const { getSocketIO } = require('../socket');

const emitConversationUpdated = (conversation, message) => {
    const io = getSocketIO();
    if (!io || !conversation) {
        return;
    }

    const consultationId = conversation.consultation_id
        ? conversation.consultation_id.toString()
        : null;

    if (!consultationId) {
        return;
    }

    io.to(`consultation:${consultationId}`).emit('conversation:message', {
        consultation_id: consultationId,
        message,
        conversation,
    });
};

const sendMessage = async (req, res) => {
    const userRole = req.user ? req.user.role : null;
    const parentId = req.user ? req.user.parent_id : null;
    const doctorId = req.user ? req.user.doctor_id : null;

    try {
        // Handle parent sending message to doctor
        if (userRole === 'parent') {
            const { doctor_id, consultation_id, content } = req.body;

            if (!content) {
                return res.status(400).json({ message: 'content is required' });
            }

            if (!doctor_id && !consultation_id) {
                return res.status(400).json({ message: 'doctor_id or consultation_id is required' });
            }

            if (!parentId) {
                return res.status(403).json({ message: 'Parent role required' });
            }

            let conversation;

            // Find conversation by consultation_id
            if (consultation_id) {
                conversation = await conversationService.findConversationByconsultationId(consultation_id);
                if (!conversation) {
                    return res.status(404).json({ message: 'Consultation not found' });
                }

                // Verify parent owns this consultation
                if (conversation.parent_id.toString() !== parentId.toString()) {
                    return res.status(403).json({ message: 'Not allowed to message in this consultation' });
                }
            } else {
                // Find or create conversation by doctor_id and parent_id
                // First get the most recent conversation with this doctor
                conversation = await conversationService.findConversationByParentAndDoctor(parentId, doctor_id);
                if (!conversation) {
                    return res.status(404).json({ message: 'No conversation found with this doctor. Schedule a consultation first.' });
                }
            }

            const message = {
                sender: 'parent',
                content,
                status: 'sent',
                timestamp: new Date(),
            };

            const updatedConversation = await conversationService.addMessageToConversation(conversation._id, message);

            emitConversationUpdated(updatedConversation, message);

            return res.status(201).json({ message: 'Message sent', data: updatedConversation });
        }
        // Handle doctor sending message to parent
        else if (userRole === 'doctor') {
            const { parent_id, consultation_id, content } = req.body;

            if (!content) {
                return res.status(400).json({ message: 'content is required' });
            }

            if (!parent_id && !consultation_id) {
                return res.status(400).json({ message: 'parent_id or consultation_id is required' });
            }

            if (!doctorId) {
                return res.status(403).json({ message: 'Doctor role required' });
            }

            let conversation;

            // Find conversation by consultation_id
            if (consultation_id) {
                conversation = await conversationService.findConversationByconsultationId(consultation_id);
                if (!conversation) {
                    return res.status(404).json({ message: 'Consultation not found' });
                }

                // Verify doctor is the one in this consultation
                if (conversation.doctor_id.toString() !== doctorId.toString()) {
                    return res.status(403).json({ message: 'Not allowed to message in this consultation' });
                }
            } else {
                // Find conversation by parent_id and doctor_id
                conversation = await conversationService.findConversationByParentAndDoctor(parent_id, doctorId);
                if (!conversation) {
                    return res.status(404).json({ message: 'No conversation found with this parent' });
                }
            }

            const message = {
                sender: 'doctor',
                content,
                status: 'sent',
                timestamp: new Date(),
            };

            const updatedConversation = await conversationService.addMessageToConversation(conversation._id, message);

            emitConversationUpdated(updatedConversation, message);

            return res.status(201).json({ message: 'Message sent', data: updatedConversation });
        }
        // Invalid role
        else {
            return res.status(403).json({ message: 'Parent or Doctor role required' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const sendMessageAsParent = async (req, res) => {
    const { doctor_id, baby_id, content } = req.body;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!doctor_id || !baby_id || !content) {
            return res.status(400).json({ message: 'doctor_id, baby_id, and content are required' });
        }

        if (!parentId) {
            return res.status(403).json({ message: 'Parent role required' });
        }

        const baby = await babyService.findBabyById(baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const isOwner = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((id) => id.toString() === parentId.toString());
        if (!isOwner) {
            return res.status(403).json({ message: 'Not allowed to chat for this baby' });
        }

        const doctor = await doctorService.findDoctorById(doctor_id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const conversation = await conversationService.findOrCreateConversation(parentId, doctor_id, baby_id);

        const message = {
            sender: 'parent',
            content,
            status: 'sent',
            timestamp: new Date(),
        };

        const updatedConversation = await conversationService.addMessageToConversation(conversation._id, message);

        emitConversationUpdated(updatedConversation, message);

        return res.status(201).json({ message: 'Message sent', data: updatedConversation });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const sendMessageAsDoctor = async (req, res) => {
    const { parent_id, baby_id, content } = req.body;
    const doctorId = req.user ? req.user.doctor_id : null;

    try {
        if (!parent_id || !baby_id || !content) {
            return res.status(400).json({ message: 'parent_id, baby_id, and content are required' });
        }

        if (!doctorId) {
            return res.status(403).json({ message: 'Doctor role required' });
        }

        const baby = await babyService.findBabyById(baby_id);
        if (!baby || !baby.status) {
            return res.status(404).json({ message: 'Baby not found' });
        }

        const hasParent = Array.isArray(baby.parent_ids)
            && baby.parent_ids.some((id) => id.toString() === parent_id.toString());
        if (!hasParent) {
            return res.status(403).json({ message: 'Parent is not linked to this baby' });
        }

        const doctor = await doctorService.findDoctorById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const conversation = await conversationService.findOrCreateConversation(parent_id, doctorId, baby_id);

        const message = {
            sender: 'doctor',
            content,
            status: 'sent',
            timestamp: new Date(),
        };

        const updatedConversation = await conversationService.addMessageToConversation(conversation._id, message);

        emitConversationUpdated(updatedConversation, message);

        return res.status(201).json({ message: 'Message sent', data: updatedConversation });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getConversation = async (req, res) => {
    const { doctor_id, consultation_id } = req.query;
    const parentId = req.user ? req.user.parent_id : null;
    const doctorUserRole = req.user ? req.user.role : null;
    const doctorIdFromToken = req.user ? req.user.doctor_id : null;

    try {
        if (!doctor_id && !consultation_id) {
            return res.status(400).json({ message: 'doctor_id or consultation_id is required' });
        }

        let conversation;

        if (consultation_id) {
            conversation = await conversationService.findConversationByconsultationId(consultation_id);
            if (!conversation) {
                return res.status(404).json({ message: 'Consultation not found' });
            }

            // Verify access: parent must own this consultation or doctor must be assigned
            if (doctorUserRole === 'parent' && conversation.parent_id.toString() !== parentId.toString()) {
                return res.status(403).json({ message: 'Not allowed to view this conversation' });
            }
            if (doctorUserRole === 'doctor' && conversation.doctor_id.toString() !== doctorIdFromToken.toString()) {
                return res.status(403).json({ message: 'Not allowed to view this conversation' });
            }
        } else if (doctor_id) {
            if (doctorUserRole === 'parent') {
                if (!parentId) {
                    return res.status(403).json({ message: 'Parent role required' });
                }
                conversation = await conversationService.findConversationByParentAndDoctor(parentId, doctor_id);
            } else if (doctorUserRole === 'doctor') {
                if (!doctorIdFromToken) {
                    return res.status(403).json({ message: 'Doctor role required' });
                }
                conversation = await conversationService.findConversationByParentAndDoctor(doctor_id, doctorIdFromToken);
            } else {
                return res.status(403).json({ message: 'Parent or Doctor role required' });
            }

            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
        }

        return res.status(200).json({ message: 'Conversation fetched', data: conversation });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    sendMessage,
    sendMessageAsParent,
    sendMessageAsDoctor,
    getConversation,
};
