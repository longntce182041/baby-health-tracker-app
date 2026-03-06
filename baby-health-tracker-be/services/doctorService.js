const Doctor = require('../models/doctors');

const createDoctor = async (doctorData) => {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
};

const findDoctorById = async (doctorId) => {
    return await Doctor.findById(doctorId);
};

const deleteDoctorById = async (doctorId) => {
    return await Doctor.findByIdAndDelete(doctorId);
};

const listDoctors = async (filter = {}) => {
    return await Doctor.find(filter).sort({ full_name: 1 });
};

const listDoctorsByIds = async (doctorIds) => {
    return await Doctor.find({ _id: { $in: doctorIds } });
};

const updateDoctor = async (doctorId, updateData) => {
    return await Doctor.findByIdAndUpdate(doctorId, updateData, { new: true });
};

module.exports = {
    createDoctor,
    findDoctorById,
    deleteDoctorById,
    updateDoctor,
    listDoctors,
    listDoctorsByIds,
};