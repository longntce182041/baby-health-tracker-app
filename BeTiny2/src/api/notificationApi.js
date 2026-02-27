import api from "./api";

export const getNotifications = async (params = {}) => {
  try {
    const res = await api.get("/notifications", { params });
    return res.data;
  } catch (error) {
    console.warn(
      "getNotifications error, dùng dữ liệu mock:",
      error?.message || error,
    );
    return { success: true, data: MOCK_NOTIFICATIONS };
  }
};

export const getNotificationById = async (id) => {
  try {
    const res = await api.get(`/notifications/${id}`);
    return res.data;
  } catch (error) {
    console.warn(
      "getNotificationById error, dùng mock:",
      error?.message || error,
    );
    const found =
      MOCK_NOTIFICATIONS.find(
        (n) => String(n.notification_id || n.id) === String(id),
      ) || null;
    return { success: true, data: found };
  }
};

export const markAsRead = async (id) => {
  try {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    console.warn("markAsRead error (mock success):", error?.message || error);
    return { success: true };
  }
};

export const markAllAsRead = async () => {
  try {
    const res = await api.patch("/notifications/read-all");
    return res.data;
  } catch (error) {
    console.warn(
      "markAllAsRead error (mock success):",
      error?.message || error,
    );
    return { success: true };
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  } catch (error) {
    console.warn(
      "deleteNotification error (mock success):",
      error?.message || error,
    );
    return { success: true };
  }
};

export const getReminders = () => {
  return api.get("/notifications/reminders");
};

export const getSystemNotifications = () => {
  return api.get("/notifications/system");
};

export const getNotificationDetail = (notificationId) => {
  return api.get(`/notifications/${notificationId}`);
};
