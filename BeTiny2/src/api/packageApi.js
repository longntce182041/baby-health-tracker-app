import api from './api';

export const getPackages = async (params = {}) => {
  const res = await api.get('/packages', { params });
  return res.data;
};

export const getPackageById = async (id) => {
  const res = await api.get(`/packages/${id}`);
  return res.data;
};

export const subscribePackage = async (packageId, data = {}) => {
  const res = await api.post(`/packages/${packageId}/subscribe`, data);
  return res.data;
};

export const getMyPackages = async () => {
  const res = await api.get('/users/my-packages');
  return res.data;
};
