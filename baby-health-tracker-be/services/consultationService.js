const Consultation = require('../models/consultations');

const createConsultation = async (consultationData) => {
    const consultation = new Consultation(consultationData);
    return await consultation.save();
};

module.exports = {
    createConsultation,
};
