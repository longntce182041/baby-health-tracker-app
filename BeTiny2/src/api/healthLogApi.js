import api from "./api";

export const createHealthLog = (babyId, data) => {
  return api.post(`/health-logs/${babyId}`, data);
};

export const getHealthLogs = (babyId) => {
  return api.get(`/health-logs?baby_id=${babyId}`);
};

export const updateHealthLog = (logId, data) => {
  return api.put(`/health-logs/${logId}`, data);
};

export const deleteHealthLog = (logId) => {
  return api.delete(`/health-logs/${logId}`);
};
