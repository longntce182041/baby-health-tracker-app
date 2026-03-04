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
    console.log("getDoctors response:", res);
    // Map backend fields to frontend expectations
    if (res?.data?.data) {
      res.data.data = res.data.data.map((doctor) => ({
        ...doctor,
        id: doctor._id,
        doctor_id: doctor._id,
      }));
    }
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
    console.log("getDoctorById response:", res);
    // Map backend fields to frontend expectations
    if (res?.data?.data) {
      res.data.data = {
        ...res.data.data,
        id: res.data.data._id,
        doctor_id: res.data.data._id,
      };
    }
    return res.data;
  } catch (error) {
    console.warn("getDoctorById error, dùng mock:", error?.message || error);
    return { success: true, data: getMockDoctorById(id) };
  }
};

export const getDoctorSchedules = async (doctorId, params = {}) => {
  try {
    const res = await api.get(`/doctors/${doctorId}/schedule`, { params });
    console.log("getDoctorSchedules response:", res);
    // Map backend fields to frontend expectations
    if (res?.data?.data) {
      res.data.data = res.data.data.map((schedule) => ({
        ...schedule,
        id: schedule._id,
        schedule_id: schedule._id,
        available_date: schedule.date,
      }));
    }
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
