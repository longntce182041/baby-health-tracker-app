const VaccineSchedule = require("../models/vaccine_schedules");

const createSchedule = async (scheduleData) => {
  const schedule = new VaccineSchedule(scheduleData);
  const saved = await schedule.save();
  return await saved.populate([
    { path: "vaccine_id" },
    { path: "location_id" },
  ]);
};

const listSchedulesByBabyId = async (babyId) => {
  return await VaccineSchedule.find({ baby_id: babyId })
    .populate("vaccine_id", "vaccine_name dose_number price")
    .populate("location_id")
    .sort({ injection_date: 1 });
};

const findScheduleById = async (scheduleId) => {
  return await VaccineSchedule.findById(scheduleId)
    .populate("vaccine_id")
    .populate("location_id");
};

const updateScheduleById = async (scheduleId, updateData) => {
  return await VaccineSchedule.findByIdAndUpdate(scheduleId, updateData, {
    new: true,
  })
    .populate("vaccine_id")
    .populate("location_id");
};

module.exports = {
  createSchedule,
  listSchedulesByBabyId,
  findScheduleById,
  updateScheduleById,
};
