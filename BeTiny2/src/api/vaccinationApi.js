import api from './api';
import { MOCK_VACCINATIONS } from '../data/babyDetailMock';

export const getVaccinations = async (babyId, params = {}) => {
  try {
    const res = await api.get(`/babies/${babyId}/vaccinations`, { params });
    return res.data;
  } catch (error) {
    console.warn('getVaccinations error, dùng mock:', error?.message || error);
    return { success: true, data: MOCK_VACCINATIONS };
  }
};

export const createVaccination = async (babyId, data) => {
  try {
    const res = await api.post(`/babies/${babyId}/vaccinations`, data);
    return res.data;
  } catch (error) {
    console.warn('createVaccination error:', error?.message || error);
    return error.response?.data || { success: false, message: error?.message || 'Không thể lưu tiêm chủng' };
  }
};

export const createVaccineSchedule = async (payload) => {
  try {
    const res = await api.post('/vaccine-schedules', payload);
    return res.data;
  } catch (error) {
    console.warn('createVaccineSchedule error:', error?.message || error);
    return error.response?.data || { success: false, message: error?.message || 'Không thể đặt lịch tiêm' };
  }
};

