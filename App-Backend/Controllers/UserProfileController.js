import UserProfile from "../Models/userProfile.js";
import { uploadToCloudinary } from "../Middlewares/UploadMiddleware.js";

// Create a new user profile
export const createUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingProfile = await UserProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ error: "Profile already exists" });
    }

    const { name, email, mobile, gender, dob, profileImage } = req.body;

    if (!name || !email || !mobile || !dob) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let finalProfileImage = profileImage || "";

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "user-profiles");
      finalProfileImage = uploadResult.secure_url;
    }

    const newProfile = new UserProfile({
      userId,
      name,
      email,
      mobile,
      gender,
      dob,
      profileImage: finalProfileImage,
    });

    await newProfile.save();

    res.status(201).json({
      message: "Profile created successfully",
      profile: newProfile,
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email or userId already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const updateData = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      gender: req.body.gender,
      dob: req.body.dob,
    };
    console.log("update data ",updateData)
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "user-profiles");
      updateData.profileImage = uploadResult.secure_url;
    } else if (req.body.profileImage) {
      updateData.profileImage = req.body.profileImage;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete user profile
export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const deleted = await UserProfile.findOneAndDelete({ userId });
    if (!deleted) return res.status(404).json({ error: "Profile not found" });

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
