import api from "./api";
import {
  MOCK_DOCTORS,
  getMockDoctorById,
  MOCK_DOCTOR_SCHEDULES,
  MOCK_DOCTOR_REVIEWS,
} from "../data/mockDoctors";

export const getDoctors = async (params = {}) => {
  try {
    const res = await api.get("/doctors", { params });
    return res.data;
  } catch (error) {
    console.warn(
      "getDoctors error, dùng dữ liệu mock:",
      error?.message || error,
    );
    return { success: true, data: MOCK_DOCTORS };
  }
};

export const getDoctorById = async (id) => {
  try {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  } catch (error) {
    console.warn("getDoctorById error, dùng mock:", error?.message || error);
    return { success: true, data: getMockDoctorById(id) };
  }
};

export const getDoctorSchedules = async (doctorId, params = {}) => {
  try {
    const res = await api.get(`/doctors/${doctorId}/schedules`, { params });
    return res.data;
  } catch (error) {
    console.warn(
      "getDoctorSchedules error, dùng mock:",
      error?.message || error,
    );
    const doctor = getMockDoctorById(doctorId);
    const list = Array.isArray(doctor?.schedules)
      ? doctor.schedules
      : MOCK_DOCTOR_SCHEDULES;
    return { success: true, data: list };
  }
};

export const getDoctorReviews = async (doctorId, params = {}) => {
  try {
    const res = await api.get(`/doctors/${doctorId}/reviews`, { params });
    return res.data;
  } catch (error) {
    console.warn("getDoctorReviews error, dùng mock:", error?.message || error);
    return { success: true, data: MOCK_DOCTOR_REVIEWS };
  }
};

export const searchDoctors = (specialty = null) => {
  const url = specialty ? `/doctors?specialty=${specialty}` : "/doctors";
  return api.get(url);
};

export const getDoctorDetail = (doctorId) => {
  return api.get(`/doctors/${doctorId}`);
};

export const addDoctor = (doctorData) => {
  return api.post("/doctors", doctorData);
};
