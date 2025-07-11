import User from '../Models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const getAlluser = async (req, res) => {
    try {
        const data = await User.find();
        res.status(200).json({
            success: true,
            message: "Fetched all users successfully",
            data,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: err,
        });
    }
};

const registerUser = async (req, res) => {
    const errors = validationResult(req);
    const { name, email, password, phoneNumber, role } = req.body;

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "10y",
        });

        const { password: _, ...userData } = newUser._doc;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: userData,
            token,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error during registration",
            error: err,
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET_KEY, {
            expiresIn: '10y',
        });

        res.status(200).json({
            success: true,
            message: `${existingUser.role} login successful`,
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Login error', error: err.message });
    }
};

// Update user 
const updateUser = async (req, res) => {
    const userId = req.query.id;  
    const { name, email, password, phoneNumber, role } = req.body;

    try {
        const updateData = { name, email, phoneNumber, role };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const { password: _, ...userData } = updatedUser._doc;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: userData,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: err.message,
        });
    }
};

// Delete user 
const deleteUser = async (req, res) => {
    const userId = req.query.id;  

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: err.message,
        });
    }
};


export { getAlluser, registerUser, loginUser, updateUser, deleteUser };
