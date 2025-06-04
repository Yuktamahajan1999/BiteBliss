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

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/resumes");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const resumeFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or Word documents are allowed!"), false);
  }
};

export const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
});
