import api from "./api";

export const getBabies = () => {
  return api.get("/babies").then((response) => {
    // Map _id to id for frontend compatibility
    if (response?.data?.data) {
      response.data.data = response.data.data.map((baby) => ({
        ...baby,
        id: baby._id,
        baby_id: baby._id,
      }));
    } else if (Array.isArray(response?.data)) {
      response.data = response.data.map((baby) => ({
        ...baby,
        id: baby._id,
        baby_id: baby._id,
      }));
    }
    return response;
  });
};

export const getBabyDetail = (babyId) => {
  return api.get(`/babies/${babyId}`).then((response) => {
    // Map _id to id for frontend compatibility
    if (response?.data?.data) {
      response.data.data = {
        ...response.data.data,
        id: response.data.data._id,
        baby_id: response.data.data._id,
      };
    }
    return response;
  });
};

export const addBaby = (babyData) => {
  return api.post("/babies", babyData).then((response) => {
    // Map _id to id for frontend compatibility
    if (response?.data?.data) {
      response.data.data = {
        ...response.data.data,
        id: response.data.data._id,
        baby_id: response.data.data._id,
      };
    }
    return response;
  });
};

export const updateBaby = (babyId, babyData) => {
  return api.put(`/babies/${babyId}`, babyData).then((response) => {
    // Map _id to id for frontend compatibility
    if (response?.data?.data) {
      response.data.data = {
        ...response.data.data,
        id: response.data.data._id,
        baby_id: response.data.data._id,
      };
    }
    return response;
  });
};

export const deleteBaby = (babyId) => {
  return api.delete(`/babies/${babyId}`);
};

export const addBabyNote = (babyId, note) => {
  return api.post(`/babies/${babyId}/notes`, { content: note });
};

export const getBabyByShareCode = (code) => {
  return api.get(`/babies/share?code=${code}`).then((response) => {
    // Map _id to id for frontend compatibility
    if (response?.data?.data) {
      response.data.data = {
        ...response.data.data,
        id: response.data.data._id,
        baby_id: response.data.data._id,
      };
    }
    return response;
  });
};

export const shareBabyToParent = (code) => {
  return api.post("/babies/share", { code });
};
