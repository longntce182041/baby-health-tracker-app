import api from './api';

export const createConsultation = async (data) => {
  try {
    const payload = {
      baby_id: data.baby_id,
      doctor_id: data.doctor_id,
      schedule_id: data.schedule_id,
      ...(data.note != null && data.note !== '' && { note: data.note }),
    };
    const res = await api.post('/consultations', payload);
    return res.data;
  } catch (error) {
    console.warn('createConsultation error, dùng mock:', error?.message || error);
    return {
      success: true,
      data: {
        id: 'mock-' + Date.now(),
        baby_id: data.baby_id,
        doctor_id: data.doctor_id,
        schedule_id: data.schedule_id,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    };
  }
};

export const getMyConsultations = async (params = {}) => {
  const res = await api.get('/consultations', { params });
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
    const res = await api.get(`/doctors/${doctorId}/booked-slots`, { params: { date } });
    const raw = res.data?.data ?? res.data?.booked_slots ?? res.data;
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((x) => (typeof x === 'string' ? x : x?.time_slot)).filter(Boolean);
  } catch (error) {
    console.warn('getBookedSlots error:', error?.message || error);
    return [];
  }
};
