import express from 'express';
import { registerUser, loginUser, getAlluser, updateUser, deleteUser } from '../Controllers/AuthControllers.js';
import { ValidationMiddleware, loginValidation } from '../Middlewares/Validation.js';
import checkLogin from '../Middlewares/CheckLogin.js';
import handleValidationErrors from '../Middlewares/ErrorValidation.js';

const Authrouter = express.Router();

// Get all users 
Authrouter.get('/', checkLogin, getAlluser);

// Register a new user
Authrouter.post('/register', ValidationMiddleware, handleValidationErrors, registerUser);

// User login
Authrouter.post('/login', loginValidation, handleValidationErrors, loginUser);

// Update user 
Authrouter.put('/updateUser', checkLogin, ValidationMiddleware, handleValidationErrors, updateUser);

// Delete user 
Authrouter.delete('/deleteUser', checkLogin, deleteUser);

export default Authrouter;
