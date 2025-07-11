import express from "express";
import checkLogin from "../Middlewares/CheckLogin.js";
import checkRole from "../Middlewares/CheckRole.js";
import { uploadResume } from "../Middlewares/UploadMiddleware.js";
import {
    createApplication,
    getApplications,
    getUserApplications,
    updateStatus,
    deleteApplication,
} from "../Controllers/ApplicationController.js";
import handleValidationErrors from "../Middlewares/ErrorValidation.js";

const Applicationrouter = express.Router();

// Create a new application 
Applicationrouter.post("/", checkLogin, uploadResume.single("resume"), handleValidationErrors, createApplication);

// Get all applications
Applicationrouter.get("/getApp", checkLogin, checkRole(['restaurantOwner']), getApplications);

// Get applications 
Applicationrouter.get("/getMyApp", checkLogin, getUserApplications);

// Update status 
Applicationrouter.put("/statusApp", checkLogin, updateStatus);

// Delete Application
Applicationrouter.delete("/deleteApp", checkLogin, deleteApplication);

export default Applicationrouter;
