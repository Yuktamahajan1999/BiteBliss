import User from '../Models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import DeliveryPartner from '../Models/DeliveryPartner.js';
import ChefProfile from '../Models/ChefForm.js';


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
    if (!['user', 'chef', 'restaurantowner', 'deliverypartner', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role provided" });
    }


    console.log("Incoming registration request:", { name, email, phoneNumber });

    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists with email:", email);
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully");

        let status = 'approved';
        if (role === 'chef' || role === 'deliverypartner') {
            status = 'pending'; 
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            status
        });

        await newUser.save();
        console.log("New user saved:", newUser._id);

        if (role === 'deliverypartner') {
            await DeliveryPartner.create({
                name,
                email,
                phone: phoneNumber,
                user: newUser._id,
                status: 'available'
            });
            console.log("DeliveryPartner profile created");
        }

        if (role === 'chef') {
            await ChefProfile.create({
                chefName: name,
                specialty: 'Not specified',
                cuisines: ['Indian'],
                price: 199,
                vegNonVeg: 'both',
                signatureDishes: ['Placeholder Dish'],
                menu: [],
                location: 'Not specified',
                contactNumber: phoneNumber,
                bio: '',
                isAvailable: true,
                status: 'approved',
                isApproved: true,
                isHygienic: true,
                createdBy: newUser._id
            });
            console.log("ChefProfile created");
        }

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "10y",
        });
        console.log("JWT token generated");

        const { password: _, ...userData } = newUser._doc;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: userData,
            token,
        });
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
            error: err.message,
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
                role: existingUser.role,
                status: existingUser.status
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
