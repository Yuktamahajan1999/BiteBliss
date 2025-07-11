import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../Config/Cloudinary.js";

const mediaFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

export const uploadMedia = multer({
  storage: multer.memoryStorage(),
  fileFilter: mediaFilter,
});

export const uploadToCloudinary = (buffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadFromUrlToCloudinary = async (url, folder = "uploads") => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      resource_type: "auto",
      folder,
    });
    return result;
  } catch (error) {
    throw error;
  }
};
