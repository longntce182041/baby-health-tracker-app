const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorScheduleSchema = new Schema({
    doctor_id: {
        type: Schema.Types.ObjectId,
        ref: 'Doctors',
        required: true
    },
    week: {
        type: Number,
        required: true
    },
    schedules: [
        {
            available_date: { type: Date, required: true },
            time_slots: [{ type: String, required: true }]
        }
    ]
});
const DoctorSchedules = mongoose.model('DoctorSchedules', doctorScheduleSchema);
module.exports = DoctorSchedules;