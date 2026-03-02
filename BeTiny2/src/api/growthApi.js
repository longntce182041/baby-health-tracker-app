import api from './api';
import { MOCK_GROWTH_RECORDS } from '../data/babyDetailMock';

export const getGrowthRecords = async (babyId, params = {}) => {
  try {
    const res = await api.get(`/babies/${babyId}/growth-records`, { params });
    return res.data;
  } catch (error) {
    console.warn('getGrowthRecords error, dùng mock:', error?.message || error);
    return { success: true, data: MOCK_GROWTH_RECORDS };
  }
};

export const createGrowthRecord = async (babyId, data) => {
  try {
    const res = await api.post(`/babies/${babyId}/growth-records`, data);
    return res.data;
  } catch (error) {
    console.warn('createGrowthRecord error:', error?.message || error);
    return error.response?.data || { success: false, message: error?.message || 'Không thể lưu số đo' };
  }
};

