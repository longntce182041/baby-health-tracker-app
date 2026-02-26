import axios from 'axios';
import { getItem, setItem, removeItem } from '../storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized = () => {};
export const setOnUnauthorized = (fn) => {
  onUnauthorized = fn || (() => {});
};

api.interceptors.request.use(
  async (config) => {
    const token = await getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const refreshToken = await getItem('refreshToken');
      if (!refreshToken) {
        await removeItem('accessToken');
        await removeItem('refreshToken');
        await removeItem('user');
        setTimeout(() => onUnauthorized(), 0);
        return Promise.reject(error);
      }
      try {
        const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        if (res.data?.success) {
          const { accessToken, refreshToken: newRt } = res.data.data;
          await setItem('accessToken', accessToken);
          await setItem('refreshToken', newRt);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        await removeItem('accessToken');
        await removeItem('refreshToken');
        await removeItem('user');
        setTimeout(() => onUnauthorized(), 0);
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
