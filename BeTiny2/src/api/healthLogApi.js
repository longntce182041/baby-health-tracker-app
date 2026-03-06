import api from "./api";

export const createHealthLog = async (babyId, data) => {
  try {
    const res = await api.post(`/health-logs/${babyId}`, data);
    console.log("createHealthLog response:", res);
    // Map backend fields to frontend expectations
    if (res?.data?.data) {
      res.data.data = {
        ...res.data.data,
        id: res.data.data._id,
      };
    }
    return res.data;
  } catch (error) {
    console.error("createHealthLog error:", error?.response?.data || error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tạo nhật ký sức khỏe",
    };
  }
};

export const getHealthLogs = async (babyId) => {
  try {
    const res = await api.get(`/health-logs?baby_id=${babyId}`);
    console.log("getHealthLogs response:", res);
    // Map backend fields to frontend expectations
    if (Array.isArray(res?.data?.data)) {
      res.data.data = res.data.data.map((log) => ({
        ...log,
        id: log._id,
        // Map backend fields to frontend
        temperature: log.tempurature, // Fix typo
        photos: log.image_urls || [],
      }));
    }
    return res.data;
  } catch (error) {
    console.error("getHealthLogs error:", error);
    return { success: false, data: [] };
  }
};

export const updateHealthLog = async (logId, data) => {
  try {
    const res = await api.put(`/health-logs/${logId}`, data);
    console.log("updateHealthLog response:", res);
    if (res?.data?.data) {
      res.data.data = {
        ...res.data.data,
        id: res.data.data._id,
      };
    }
    return res.data;
  } catch (error) {
    console.error("updateHealthLog error:", error?.response?.data || error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật nhật ký",
    };
  }
};

export const deleteHealthLog = async (logId) => {
  try {
    const res = await api.delete(`/health-logs/${logId}`);
    return res.data;
  } catch (error) {
    console.error("deleteHealthLog error:", error);
    return {
      success: false,
      message: error?.message || "Không thể xóa nhật ký",
    };
  }
};
