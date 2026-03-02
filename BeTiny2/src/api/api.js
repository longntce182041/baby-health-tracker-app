import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Thay đổi URL theo môi trường
const API_URL = "http:///192.168.3.190:3000/api"; // Hoặc IP server thực tế

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
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
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
  async (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("user");

      // Gọi callback để navigate về login
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
