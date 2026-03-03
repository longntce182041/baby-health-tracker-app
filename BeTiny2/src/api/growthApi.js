import api from "./api";

export const getGrowthRecords = (babyId) => {
  return api.get(`/growth-records?baby_id=${babyId}`).then((response) => {
    // Backend returns {data: {baby_id, points: [...]}}
    // Map record_date to recorded_at for frontend compatibility
    if (response?.data?.data?.points) {
      response.data.data.points = response.data.data.points.map((record) => ({
        ...record,
        recorded_at: record.record_date || record.recorded_at,
      }));
    } else if (response?.data?.points) {
      response.data.points = response.data.points.map((record) => ({
        ...record,
        recorded_at: record.record_date || record.recorded_at,
      }));
    }
    return response;
  });
};

export const createGrowthRecord = (babyId, data) => {
  return api.post(`/growth-records/${babyId}`, {
    weight: data.weight,
    height: data.height,
    head_size: data.head_size || data.head_circumference,
    record_date: data.recorded_at || new Date().toISOString(),
  });
};

export const compareGrowthWithStandard = (babyId, recordId = null) => {
  const url = recordId
    ? `/growth-records/compare?baby_id=${babyId}&record_id=${recordId}`
    : `/growth-records/compare?baby_id=${babyId}`;
  return api.get(url);
};
