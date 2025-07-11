import UserProfile from "../Models/userProfile.js";
import { uploadToCloudinary } from "../Middlewares/UploadMiddleware.js";

// Create profile
export const createUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const existingProfile = await UserProfile.findOne({ userId });

    if (existingProfile) {
      return res.status(400).json({ error: "Profile already exists" });
    }

    const { name, email, mobile, gender, dob } = req.body;
    if (!name || !email || !mobile || !dob) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let profileImage = "";
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "user-profiles");
      profileImage = uploadResult.secure_url;
    }

    const newProfile = new UserProfile({
      userId,
      name,
      email,
      mobile,
      gender,
      dob,
      profileImage,
    });

    await newProfile.save();

    res.status(201).json({ message: "Profile created successfully", profile: newProfile });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const updateData = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      gender: req.body.gender,
      dob: req.body.dob,
    };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "user-profiles");
      updateData.profileImage = uploadResult.secure_url;
    } else if (req.body.profileImage) {
      updateData.profileImage = req.body.profileImage;
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete profile
export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const deleted = await UserProfile.findOneAndDelete({ userId });
    if (!deleted) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
