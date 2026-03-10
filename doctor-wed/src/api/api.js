import axios from "axios";

// Thay đổi URL theo môi trường
export const API_URL = "http://localhost:3000/api"; // Hoặc IP server thực tế
export const SOCKET_URL = API_URL.replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Callback để xử lý unauthorized
let onUnauthorizedCallback = null;

export const setOnUnauthorized = (callback) => {
  onUnauthorizedCallback = callback;
};

// Interceptor request - thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor response - xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Gọi callback để navigate về login
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
