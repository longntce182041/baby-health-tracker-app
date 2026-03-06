const Consultation = require('../models/consultations');

const createConsultation = async (consultationData) => {
    const consultation = new Consultation(consultationData);
    return await consultation.save();
};

const listConsultations = async (filter = {}) => {
    return await Consultation.find(filter)
        .sort({ consultation_time: -1, createdAt: -1 })
        .populate('doctor_id')
        .populate('baby_id')
        .populate('parent_id')
        .populate('schedule_id');
};

const findConsultationById = async (consultationId) => {
    return await Consultation.findById(consultationId)
        .populate('doctor_id')
        .populate('baby_id')
        .populate('parent_id')
        .populate('schedule_id');
};

const updateConsultationById = async (consultationId, updateData) => {
    return await Consultation.findByIdAndUpdate(
        consultationId,
        updateData,
        { new: true }
    )
        .populate('doctor_id')
        .populate('baby_id')
        .populate('parent_id')
        .populate('schedule_id');
};

const getConsultationStatusSummary = async () => {
    const grouped = await Consultation.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const summary = {
        scheduled: 0,
        completed: 0,
        canceled: 0,
        total: 0,
    };

    for (const item of grouped) {
        if (item && item._id && summary[item._id] !== undefined) {
            summary[item._id] = item.count;
            summary.total += item.count;
        }
    }

    return summary;
};

module.exports = {
    createConsultation,
    listConsultations,
    findConsultationById,
    updateConsultationById,
    getConsultationStatusSummary,
};
