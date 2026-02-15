const HealthLog = require('../models/health_logs');

const createHealthLog = async (logData) => {
    const log = new HealthLog(logData);
    return await log.save();
};

const listHealthLogsByBabyId = async (babyId) => {
    return await HealthLog.find({ baby_id: babyId }).sort({ log_date: -1 });
};

const findHealthLogById = async (logId) => {
    return await HealthLog.findById(logId);
};

const updateHealthLogById = async (logId, updateData) => {
    return await HealthLog.findByIdAndUpdate(logId, updateData, { new: true });
};

const deleteHealthLogById = async (logId) => {
    return await HealthLog.findByIdAndDelete(logId);
};

module.exports = {
    createHealthLog,
    listHealthLogsByBabyId,
    findHealthLogById,
    updateHealthLogById,
    deleteHealthLogById,
};
