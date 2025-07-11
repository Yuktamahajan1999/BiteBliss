import express from "express";
import checkLogin from "../Middlewares/CheckLogin.js";
import checkRole from "../Middlewares/CheckRole.js";
import {
    createApplication,
    getApplications,
    getUserApplications,
    updateStatus,
    deleteApplication,
    updateApplicationByUser,
} from "../Controllers/ApplicationController.js";
import handleValidationErrors from "../Middlewares/ErrorValidation.js";
import { applicationValidationRules } from "../Middlewares/Validation.js";

const Applicationrouter = express.Router();

// Create a new application 
Applicationrouter.post("/",
    checkLogin,
    applicationValidationRules,
    handleValidationErrors,
    createApplication
);

// Get all applications
Applicationrouter.get("/getApp", checkLogin, checkRole(['admin']), getApplications);

// Get applications 
Applicationrouter.get("/getMyApp", checkLogin, getUserApplications);

// Update status 
Applicationrouter.put("/statusApp", checkLogin, checkRole(['admin']), updateStatus);

// Update status by user
Applicationrouter.put("/updateApp", checkLogin, checkRole(['user']), updateApplicationByUser);

// Delete Application
Applicationrouter.delete("/deleteApp", checkLogin, deleteApplication);

export default Applicationrouter;
