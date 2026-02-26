const DoctorSchedule = require('../models/doctor_schedules');

const findScheduleByDoctorAndDate = async (doctorId, date) => {
    return await DoctorSchedule.findOne({ doctor_id: doctorId, date });
};

const findAvailableSchedules = async () => {
    return await DoctorSchedule.find({
        status: 'available',
        'slots.is_booked': false,
    }).populate('doctor_id');
};

const upsertScheduleForDate = async (doctorId, date, slots, note, status = 'available') => {
    return await DoctorSchedule.findOneAndUpdate(
        { doctor_id: doctorId, date },
        {
            doctor_id: doctorId,
            date,
            slots,
            note,
            status,
        },
        { new: true, upsert: true }
    );
};

module.exports = {
    findScheduleByDoctorAndDate,
    findAvailableSchedules,
    upsertScheduleForDate,
};
