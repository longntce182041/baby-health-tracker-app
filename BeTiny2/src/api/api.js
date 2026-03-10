import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Thay đổi URL theo môi trường
// Development URL configuration:
// - iOS Simulator: Use localhost
// - Android Emulator: Use 10.0.2.2 (special alias to host machine)
// - Physical Device: Use your computer's local IP address (e.g., 192.168.1.x)

const getBaseURL = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000/api"; // Android emulator
    } else {
      return "http://localhost:3000/api"; // iOS simulator
    }
  } else {
    // Production mode
    return "https://baby-health-tracker-app.onrender.com/api";
  }
};

export const API_URL = getBaseURL();
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
