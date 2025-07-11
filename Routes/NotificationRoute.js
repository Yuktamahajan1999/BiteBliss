import express from "express";
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} from "../Controllers/NotificationController.js";

const notificationRouter = express.Router();

// Create a notification
notificationRouter.post('/', createNotification);

// Get all notifications
notificationRouter.get('/getAllnotify', getAllNotifications);

// Get notification details by ID
notificationRouter.get('/getByIdnotify', getNotificationById);

// Update a notification
notificationRouter.put('/updatenotify', updateNotification);

// Delete a notification
notificationRouter.delete('/deletenotify', deleteNotification);

export default notificationRouter;