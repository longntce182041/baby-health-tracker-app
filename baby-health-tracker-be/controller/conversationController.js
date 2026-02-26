const babyService = require('../services/babyService');
const doctorService = require('../services/doctorService');
const conversationService = require('../services/conversationService');

const sendMessage = async (req, res) => {
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

        return res.status(201).json({ message: 'Message sent', data: updatedConversation });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getConversation = async (req, res) => {
    const { doctor_id, baby_id } = req.query;
    const parentId = req.user ? req.user.parent_id : null;

    try {
        if (!doctor_id || !baby_id) {
            return res.status(400).json({ message: 'doctor_id and baby_id are required' });
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
            return res.status(403).json({ message: 'Not allowed to view chat for this baby' });
        }

        const doctor = await doctorService.findDoctorById(doctor_id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const conversation = await conversationService.findOrCreateConversation(parentId, doctor_id, baby_id);

        return res.status(200).json({ message: 'Conversation fetched', data: conversation });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    sendMessage,
    getConversation,
};
