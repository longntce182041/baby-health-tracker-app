import api from "./api";
import { MOCK_PARENT_PROFILE } from "../data/mockAuth";

export const getProfile = async () => {
  try {
    const res = await api.get("/users/me");
    return res.data;
  } catch (error) {
    console.warn(
      "getProfile error, dùng mock profile:",
      error?.message || error,
    );
    return { success: true, data: MOCK_PARENT_PROFILE };
  }
};

export const updateProfile = async (data) => {
  try {
    const res = await api.put("/users/profile", data);
    return res.data;
  } catch (error) {
    console.warn("updateProfile error:", error?.message || error);
    return (
      error.response?.data || {
        success: false,
        message: error?.message || "Không thể cập nhật hồ sơ",
      }
    );
  }
};

export const getTransactions = async (params = {}) => {
  try {
    const res = await api.get("/transactions/me", { params });
    return res.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const fallbackRes = await api.get("/payments/history", { params });
      return fallbackRes.data;
    }
    throw error;
  }
};

export const changePassword = async (current_password, new_password) => {
  try {
    const res = await api.put("/profile/password", {
      current_password,
      new_password,
    });
    return res.data;
  } catch (error) {
    console.warn("changePassword error:", error?.message || error);
    return (
      error.response?.data || {
        success: false,
        message: error?.message || "Không thể thay đổi mật khẩu",
      }
    );
  }
};
