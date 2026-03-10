import api from "./api";

export const uploadImage = async (formData) => {
  try {
    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 seconds for image upload
    });
    return response.data;
  } catch (error) {
    console.error("Upload image error:", error);
    throw error;
  }
};

export const uploadImages = async (formData) => {
  try {
    const response = await api.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for multiple images
    });
    return response.data;
  } catch (error) {
    console.error("Upload images error:", error);
    throw error;
  }
};

export const deleteImage = async (publicId) => {
  try {
    const response = await api.delete("/upload/image", {
      data: { public_id: publicId },
    });
    return response.data;
  } catch (error) {
    console.error("Delete image error:", error);
    throw error;
  }
};
