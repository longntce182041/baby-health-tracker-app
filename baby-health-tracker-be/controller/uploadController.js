const cloudinary = require("../configs/CloudinaryConfig");
const multer = require("multer");

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

const uploadSingle = upload.single("image");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload to Cloudinary using upload_stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "baby-health-tracker",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    res.status(200).json({
      message: "Image uploaded successfully",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Failed to upload image",
      error: error.message,
    });
  }
};

const uploadMultiple = upload.array("images", 5);

const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "baby-health-tracker",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      message: "Images uploaded successfully",
      data: results.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
      })),
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Failed to upload images",
      error: error.message,
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: "public_id is required" });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "ok") {
      res.status(200).json({
        message: "Image deleted successfully",
        data: result,
      });
    } else {
      res.status(400).json({
        message: "Failed to delete image",
        data: result,
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      message: "Failed to delete image",
      error: error.message,
    });
  }
};

module.exports = {
  uploadSingle,
  uploadImage,
  uploadMultiple,
  uploadImages,
  deleteImage,
};
