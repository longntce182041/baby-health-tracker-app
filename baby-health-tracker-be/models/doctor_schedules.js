const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorScheduleSchema = new Schema({
    doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctors', required: true },

    // Lưu ngày cụ thể (ví dụ: 2024-05-20)
    date: { type: Date, required: true },

    // Danh sách các khung giờ trong ngày đó
    slots: [
        {
            start_time: { type: String, required: true }, // "08:00"
            end_time: { type: String, required: true },   // "09:00"
            is_booked: { type: Boolean, default: false },
            patient_id: { type: Schema.Types.ObjectId, ref: 'Users', default: null }
        }
    ],

    note: { type: String }, // Ghi chú cho ngày đó (ví dụ: "Khám ngoài giờ")
    status: { type: String, enum: ['available', 'busy', 'off'], default: 'available' }
}, { timestamps: true });

// Index quan trọng để tìm kiếm nhanh theo ngày và bác sĩ
doctorScheduleSchema.index({ doctor_id: 1, date: 1 }, { unique: true });

const DoctorSchedules = mongoose.model('DoctorSchedules', doctorScheduleSchema);
module.exports = DoctorSchedules;