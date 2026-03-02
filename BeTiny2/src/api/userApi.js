import api from './api';
import { MOCK_PARENT_PROFILE } from '../data/mockAuth';

export const getProfile = async () => {
  try {
    const res = await api.get('/users/profile');
    return res.data;
  } catch (error) {
    console.warn('getProfile error, dùng mock profile:', error?.message || error);
    return { success: true, data: MOCK_PARENT_PROFILE };
  }
};

export const updateProfile = async (data) => {
  try {
    const res = await api.put('/users/profile', data);
    return res.data;
  } catch (error) {
    console.warn('updateProfile error:', error?.message || error);
    return error.response?.data || { success: false, message: error?.message || 'Không thể cập nhật hồ sơ' };
  }
};

export const getTransactions = async (params = {}) => {
  const res = await api.get('/users/transactions', { params });
  return res.data;
};
