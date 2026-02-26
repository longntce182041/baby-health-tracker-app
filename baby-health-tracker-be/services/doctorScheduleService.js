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

module.exports = {
    findScheduleByDoctorAndDate,
    findAvailableSchedules,
};
