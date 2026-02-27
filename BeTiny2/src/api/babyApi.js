import api from "./api";

export const getBabies = () => {
  return api.get("/babies");
};

export const getBabyDetail = (babyId) => {
  return api.get(`/babies/${babyId}`);
};

export const addBaby = (babyData) => {
  return api.post("/babies", babyData);
};

export const updateBaby = (babyId, babyData) => {
  return api.put(`/babies/${babyId}`, babyData);
};

export const deleteBaby = (babyId) => {
  return api.delete(`/babies/${babyId}`);
};

export const addBabyNote = (babyId, note) => {
  return api.post(`/babies/${babyId}/notes`, { content: note });
};

export const getBabyByShareCode = (code) => {
  return api.get(`/babies/share?code=${code}`);
};

export const shareBabyToParent = (code) => {
  return api.post("/babies/share", { code });
};
