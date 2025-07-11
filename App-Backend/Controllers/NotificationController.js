import Notification from "../Models/NotificationModel.js";

// Create a new notification
export const createNotification = async (req, res) => {
  const { sms, email, push } = req.body;
  if (sms === undefined || email === undefined || push === undefined) {
    return res.status(400).json({ error: "sms, email, and push are required" });
  }

  try {
    const newNotification = new Notification({ sms, email, push });
    await newNotification.save();

    if (email) {
      try {
        await sendConfirmationEmail({
          email: "user@example.com",
          name: "User Name",
          position: "Notification Preference Update",
        });
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr);
      }
    }

    res.status(201).json({ success: true, data: newNotification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get notification by ID
export const getNotificationById = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update notification
export const updateNotification = async (req, res) => {
  const { id, sms, email, push } = req.body;
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const updated = await Notification.findByIdAndUpdate(
      id,
      { sms, email, push },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Notification not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "id is required" });

  try {
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Notification not found" });

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
