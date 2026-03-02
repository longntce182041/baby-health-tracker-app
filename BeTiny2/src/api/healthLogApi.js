import api from './api';
import { MOCK_HEALTH_LOG_GROUPS } from '../data/mockHealthLogs';

export const getHealthLogs = async (babyId, params = {}) => {
  try {
    const res = await api.get(`/babies/${babyId}/health-logs`, { params });
    return res.data;
  } catch (error) {
    console.warn('getHealthLogs error, dùng mock:', error?.message || error);
    return { success: true, data: MOCK_HEALTH_LOG_GROUPS };
  }
};

export const createHealthLog = async (babyId, data) => {
  try {
    const res = await api.post(`/babies/${babyId}/health-logs`, data);
    return res.data;
  } catch (error) {
    console.warn('createHealthLog error:', error?.message || error);
    return error.response?.data || { success: false, message: error?.message || 'Không thể lưu nhật ký' };
  }
};

