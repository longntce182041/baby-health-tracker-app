import api from "./api";

export const createConsultation = async (data) => {
  try {
    const payload = {
      baby_id: data.baby_id,
      doctor_id: data.doctor_id,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      ...(data.notes != null && data.notes !== "" && { notes: data.notes }),
      ...(data.note != null && data.note !== "" && { notes: data.note }),
    };
    console.log("createConsultation API payload:", payload);
    const res = await api.post("/consultations", payload);
    console.log("createConsultation API response status:", res.status);
    console.log("createConsultation API response data:", res.data);

    // Map backend fields to frontend expectations
    if (res?.data?.data) {
      res.data.data = {
        ...res.data.data,
        id: res.data.data._id,
      };
      return {
        success: true,
        message: res.data.message || "Consultation created successfully",
        data: res.data.data,
      };
    }

    // If no data but status is success, still return the response
    return {
      success: true,
      message: res.data.message || "Consultation created",
      data: res.data,
    };
  } catch (error) {
    console.error("createConsultation API error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đặt lịch tư vấn",
      data: null,
    };
  }
};

export const getMyConsultations = async (params = {}) => {
  const res = await api.get("/consultations", { params });
  return res.data;
};

export const getConsultationById = async (id) => {
  const res = await api.get(`/consultations/${id}`);
  return res.data;
};

export const cancelConsultation = async (id) => {
  const res = await api.patch(`/consultations/${id}/cancel`);
  return res.data;
};
export const getBookedSlots = async (doctorId, date) => {
  try {
    const res = await api.get(`/doctors/${doctorId}/booked-slots`, {
      params: { date },
    });
    const raw = res.data?.data ?? res.data?.booked_slots ?? res.data;
    const arr = Array.isArray(raw) ? raw : [];
    return arr
      .map((x) => (typeof x === "string" ? x : x?.time_slot))
      .filter(Boolean);
  } catch (error) {
    console.warn("getBookedSlots error:", error?.message || error);
    return [];
  }
};

export const scheduleConsultation = (data) => {
  return api.post("/consultations", data);
};

export const getConsultationDoctors = () => {
  return api.get("/consultation-doctors");
};

export const sendMessageToDoctor = (doctorId, babyId, content) => {
  return api.post("/conversations/send", {
    doctor_id: doctorId,
    baby_id: babyId,
    content,
  });
};

export const getConversation = (doctorId, babyId) => {
  return api.get(`/conversations?doctor_id=${doctorId}&baby_id=${babyId}`);
};
