import api from "./api";

export const getConsultationConversation = async (consultationId) => {
    try {
        const res = await api.get("/conversations", {
            params: { consultation_id: consultationId },
        });
        return res.data?.data || null;
    } catch (error) {
        throw (
            error.response?.data || {
                message: error.message || "Khong the tai cuoc tro chuyen",
            }
        );
    }
};

export const sendDoctorMessage = async ({ consultationId, content }) => {
    try {
        const res = await api.post("/conversations/send", {
            consultation_id: consultationId,
            content,
        });
        return res.data?.data || null;
    } catch (error) {
        throw (
            error.response?.data || {
                message: error.message || "Khong the gui tin nhan",
            }
        );
    }
};
