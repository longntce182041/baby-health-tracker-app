import api from './api';
import { MOCK_BABIES } from '../data/mockBabies';
import { getMockBabyById } from '../data/babyDetailMock';

export const getBabies = async () => {
  try {
    const res = await api.get('/babies');
    return res.data;
  } catch (error) {
    console.warn('getBabies error, dùng dữ liệu mock:', error?.message || error);
    return { success: true, data: MOCK_BABIES };
  }
};

export const getBabyById = async (id) => {
  try {
    const res = await api.get(`/babies/${id}`);
    return res.data;
  } catch (error) {
    console.warn('getBabyById error, dùng mock:', error?.message || error);
    return { success: true, data: getMockBabyById(id) };
  }
};

export const createBaby = async (data) => {
  try {
    const res = await api.post('/babies', data);
    return res.data;
  } catch (error) {
    console.warn('createBaby error:', error?.message || error);
    return error.response?.data || { success: false, message: error?.message || 'Không thể thêm bé' };
  }
};

export const updateBaby = async (id, data) => {
  try {
    const res = await api.put(`/babies/${id}`, data);
    return res.data;
  } catch (error) {
    console.warn('updateBaby error:', error?.message || error);
    return error.response?.data || { success: false, message: error?.message || 'Không thể cập nhật' };
  }
};

export const deleteBaby = async (id) => {
  try {
    const res = await api.delete(`/babies/${id}`);
    return res.data;
  } catch (error) {
    console.warn('deleteBaby error:', error?.message || error);
    return error.response?.data || { success: false, message: error?.message || 'Không thể xóa' };
  }
};
