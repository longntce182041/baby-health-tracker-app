import api from "./api";
import { MOCK_VACCINATIONS } from "../data/babyDetailMock";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const status = error?.response?.status;
  return (
    !status ||
    status === 408 ||
    status === 429 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
};

const requestWithRetry = async (requestFn, retries = 1, delayMs = 1200) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryableError(error)) {
        throw error;
      }
      await wait(delayMs);
    }
  }
  throw lastError;
};

export const getVaccinations = async (babyId, params = {}) => {
  try {
    const res = await api.get(`/babies/${babyId}/vaccinations`, { params });
    return res.data;
  } catch (error) {
    console.warn("getVaccinations error, dùng mock:", error?.message || error);
    return { success: true, data: MOCK_VACCINATIONS };
  }
};

export const createVaccination = async (babyId, data) => {
  try {
    const res = await api.post(`/babies/${babyId}/vaccinations`, data);
    return res.data;
  } catch (error) {
    console.warn("createVaccination error:", error?.message || error);
    return (
      error.response?.data || {
        success: false,
        message: error?.message || "Không thể lưu tiêm chủng",
      }
    );
  }
};

export const createVaccineSchedule = async (payload) => {
  try {
    const res = await api.post("/vaccination-schedules", payload);
    return res.data;
  } catch (error) {
    console.warn("createVaccineSchedule error:", error?.message || error);
    console.warn(
      "createVaccineSchedule detail:",
      error?.response?.status,
      error?.response?.data,
      payload,
    );

    const backendError = error?.response?.data?.error || "";
    const legacyPopulateBug =
      error?.response?.status === 500 &&
      typeof backendError === "string" &&
      backendError.includes("saved.populate(...).populate is not a function");

    // Compatibility fallback: old backend version may save successfully but fail while populating response.
    if (legacyPopulateBug) {
      return {
        message:
          "Lịch đã được tạo nhưng server trả về lỗi populate. Vui lòng cập nhật backend.",
        data: {
          ...payload,
          status: "scheduled",
        },
      };
    }

    return (
      error.response?.data || {
        success: false,
        message: error?.message || "Không thể đặt lịch tiêm",
      }
    );
  }
};

export const getVaccines = async () => {
  return requestWithRetry(
    () => api.get("/vaccinations", { timeout: 20000 }),
    2,
    1400,
  );
};

export const getVaccineLocations = async (vaccineId) => {
  return requestWithRetry(
    () => api.get(`/vaccinations/${vaccineId}/locations`, { timeout: 20000 }),
    2,
    1400,
  );
};

export const bookVaccinationAppointment = (data) => {
  return api.post("/vaccination-schedules", data);
};

export const getVaccinationSchedules = async (babyId) => {
  try {
    const res = await requestWithRetry(
      () =>
        api.get(`/vaccination-schedules?baby_id=${babyId}`, { timeout: 20000 }),
      1,
      1000,
    );
    // Map backend fields to frontend expectations
    if (res?.data?.data) {
      res.data.data = res.data.data.map((schedule) => ({
        ...schedule,
        id: schedule._id || schedule.id,
        vaccination_id: schedule._id || schedule.id,
        vaccination_date: schedule.injection_date,
        scheduled_date: schedule.injection_date,
        // Extract vaccine name from populated vaccine_id
        vaccine_name: schedule.vaccine_id?.vaccine_name || "Tiêm chủng",
        dose_number: schedule.vaccine_id?.dose_number,
      }));
    }
    return res;
  } catch (error) {
    console.warn("getVaccinationSchedules error:", error?.message || error);
    return { success: false, data: [], message: error?.message };
  }
};

export const getVaccinationScheduleDetail = (scheduleId) => {
  return api.get(`/vaccination-schedules/${scheduleId}`);
};

export const updateVaccinationSchedule = (scheduleId, data) => {
  return api.put(`/vaccination-schedules/${scheduleId}`, data);
};

export const markVaccinationCompleted = (scheduleId) => {
  return api.patch(`/vaccination-schedules/${scheduleId}/complete`);
};

export const getVaccinationNotes = (scheduleId) => {
  return api.get(`/vaccination-schedules/${scheduleId}/notes`);
};
