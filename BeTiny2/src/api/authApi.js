import api from "./api";
import { getItem, setItem, removeItem } from "../storage";
import { TEST_PHONE, TEST_PASSWORD, TEST_USER } from "../data/mockAuth";

export const register = async (userData) => {
  try {
    const res = await api.post("/register", userData);
    // Register thường không trả token, token sẽ có sau khi verify OTP
    // Chỉ lưu token nếu API có trả về
    if (res.data?.data?.token) {
      const { token, account_id, parent_id, role, email } = res.data.data;
      await setItem("accessToken", token);
      await setItem("refreshToken", token);

      const user = {
        account_id,
        parent_id,
        role,
        email: email || userData.email,
      };
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
    console.log("API login response:", res.data);

    // API trả về: { data: { data: { token, account_id, parent_id, role }, message } }
    if (res.data?.data) {
      const { token, account_id, parent_id, role, email } = res.data.data;
      console.log("Saving tokens - accessToken:", token);

      // Tạo user object từ response
      const user = {
        account_id: account_id,
        parent_id: parent_id,
        role: role,
        email: email || credentials.email,
      };
      console.log("Saving user:", user);

      await setItem("accessToken", token);
      await setItem("refreshToken", token); // Dùng token chung nếu BE không trả refreshToken
      await setItem("user", JSON.stringify(user));
    }
    return res.data;
  } catch (error) {
    console.log("API login error:", error);
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

export const verifyOtp = async (email, otp) => {
  try {
    const res = await api.post("/verify-otp", { email, otp });
    console.log("API verifyOtp response:", res.data);

    // API trả về tương tự login: { data: { token, account_id, parent_id, role }, message }
    if (res.data?.data?.token) {
      const { token, account_id, parent_id, role } = res.data.data;
      console.log("Saving tokens from OTP verification - accessToken:", token);

      const user = {
        account_id,
        parent_id,
        role,
        email,
      };
      console.log("Saving user from OTP:", user);

      await setItem("accessToken", token);
      await setItem("refreshToken", token);
      await setItem("user", JSON.stringify(user));
    }
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: error.message || "Xác thực OTP thất bại",
      }
    );
  }
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

export const getProfile = async () => {
  try {
    // Token will be automatically added by api.js interceptor
    const res = await api.get("/me");

    console.log("Get profile response:", res.data);
    return res.data;
  } catch (error) {
    console.log("Get profile error:", error);
    throw (
      error.response?.data || {
        message: error.message || "Lấy thông tin thất bại",
      }
    );
  }
};

export const updateProfile = (data) => {
  return api.put("/me", data);
};

export const changePassword = (current_password, new_password) => {
  return api.put("/me/password", { current_password, new_password });
};
