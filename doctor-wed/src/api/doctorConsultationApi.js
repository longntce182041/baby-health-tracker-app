import api from "./api";

export const getUpcomingConsultations = async (limit = 10) => {
    try {
        const res = await api.get("/doctor/consultations/upcoming", {
            params: { limit },
        });

        return res.data?.data || [];
    } catch (error) {
        throw (
            error.response?.data || {
                message: error.message || "Không thể tải upcoming consultations",
            }
        );
    }
};

export const getDoctorConsultationStats = async () => {
    try {
        const res = await api.get("/doctor/consultations/stats");
        return res.data?.data || null;
    } catch (error) {
        throw (
            error.response?.data || {
                message: error.message || "Không thể tải consultation stats",
            }
        );
    }
};

export const getDoctorConsultations = async (params = {}) => {
    try {
        const res = await api.get("/doctor/consultations", {
            params,
        });

        return res.data?.data || [];
    } catch (error) {
        throw (
            error.response?.data || {
                message: error.message || "Không thể tải danh sách consultations",
            }
        );
    }
};

export const endDoctorConsultation = async (consultationId) => {
    try {
        const res = await api.patch(`/doctor/consultations/${consultationId}/end`);
        return res.data?.data || null;
    } catch (error) {
        throw (
            error.response?.data || {
                message: error.message || "Không thể kết thúc consultation",
            }
        );
    }
};
