const DoctorSchedule = require("../models/doctor_schedules");

const findScheduleByDoctorAndDate = async (doctorId, date) => {
  // Ensure date is a Date object for MongoDB query
  const queryDate = date instanceof Date ? date : new Date(date);
  console.log("findScheduleByDoctorAndDate query:", {
    doctorId,
    queryDate,
    queryDateISO: queryDate.toISOString(),
  });
  return await DoctorSchedule.findOne({ doctor_id: doctorId, date: queryDate });
};

const findDoctorSchedules = async (doctorId, fromDate, toDate) => {
  const query = { doctor_id: doctorId };

  if (fromDate && toDate) {
    query.date = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

  return await DoctorSchedule.find(query)
    .sort({ date: 1 })
    .populate("doctor_id");
};

const findAvailableSchedules = async () => {
  return await DoctorSchedule.find({
    status: "available",
  }).populate("doctor_id");
};

const upsertScheduleForDate = async (
  doctorId,
  date,
  slots,
  note,
  status = "available",
) => {
  return await DoctorSchedule.findOneAndUpdate(
    { doctor_id: doctorId, date },
    {
      doctor_id: doctorId,
      date,
      slots,
      note,
      status,
    },
    { new: true, upsert: true },
  );
};

module.exports = {
  findScheduleByDoctorAndDate,
  findDoctorSchedules,
  findAvailableSchedules,
  upsertScheduleForDate,
};
