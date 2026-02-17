import api from './api';

export const createReview = async (doctorId, data) => {
  const res = await api.post(`/doctors/${doctorId}/reviews`, data);
  return res.data;
};
