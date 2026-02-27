import api from "./api";
import { getItem, setItem, removeItem } from "../storage";
import { TEST_PHONE, TEST_PASSWORD, TEST_USER } from "../data/mockAuth";

export const register = async (userData) => {
  try {
    const res = await api.post("/register", userData);
    if (res.data?.success) {
      const { user, accessToken, refreshToken } = res.data.data;
      await setItem("accessToken", accessToken);
      await setItem("refreshToken", refreshToken);
      await setItem("user", JSON.stringify(user));
    }
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || { message: error.message || "Đăng ký thất bại" }
    );
  }
};

export const login = async (credentials) => {
  const phone = (credentials?.phone || "").trim().replace(/\s/g, "");
  const password = credentials?.password || "";

  try {
    const res = await api.post("/login", credentials);
    if (res.data?.success) {
      const { user, accessToken, refreshToken } = res.data.data;
      await setItem("accessToken", accessToken);
      await setItem("refreshToken", refreshToken);
      await setItem("user", JSON.stringify(user));
    }
    return res.data;
  } catch (error) {
    const backend = error.response?.data;
    if (backend) throw backend;

    const isTestAccount = phone === TEST_PHONE && password === TEST_PASSWORD;
    if (isTestAccount) {
      await setItem("accessToken", "test-token");
      await setItem("refreshToken", "test-refresh");
      await setItem("user", JSON.stringify(TEST_USER));
      return {
        success: true,
        data: { user: TEST_USER },
        message: "Đăng nhập thành công (tài khoản test)",
      };
    }

    throw { message: error.message || "Đăng nhập thất bại" };
  }
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } catch (e) {}
  await removeItem("accessToken");
  await removeItem("refreshToken");
  await removeItem("user");
};

export const getMe = async () => {
  const res = await api.get("/me");
  return res.data;
};

export const isAuthenticated = async () => {
  const token = await getItem("accessToken");
  const user = await getItem("user");
  return !!(token && user);
};

export const getCurrentUser = async () => {
  const user = await getItem("user");
  return user ? JSON.parse(user) : null;
};

export const registerParent = (email, password, fullName, phone) => {
  return api.post("/register", { email, password, full_name: fullName, phone });
};

export const verifyOtp = (email, otp) => {
  return api.post("/verify-otp", { email, otp });
};

export const loginParent = (email, password) => {
  return api.post("/login", { email, password });
};

export const forgotPassword = (email) => {
  return api.post("/forgot-password", { email });
};

export const resetPassword = (email, otp, new_password) => {
  return api.post("/reset-password", { email, otp, new_password });
};

export const getProfile = () => {
  return api.get("/me");
};

export const updateProfile = (data) => {
  return api.put("/me", data);
};

export const changePassword = (current_password, new_password) => {
  return api.put("/me/password", { current_password, new_password });
};
