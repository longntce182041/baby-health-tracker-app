const VaccineSchedule = require('../models/vaccine_schedules');

const createSchedule = async (scheduleData) => {
    const schedule = new VaccineSchedule(scheduleData);
    return await schedule.save();
};

const listSchedulesByBabyId = async (babyId) => {
    return await VaccineSchedule.find({ baby_id: babyId }).sort({ injection_date: 1 });
};

const findScheduleById = async (scheduleId) => {
    return await VaccineSchedule.findById(scheduleId);
};

const updateScheduleById = async (scheduleId, updateData) => {
    return await VaccineSchedule.findByIdAndUpdate(scheduleId, updateData, { new: true });
};

module.exports = {
    createSchedule,
    listSchedulesByBabyId,
    findScheduleById,
    updateScheduleById,
};
