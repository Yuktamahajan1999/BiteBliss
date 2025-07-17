/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      toast.error('Please select a role', { position: 'top-center', autoClose: 3000 });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!', { position: 'top-center', autoClose: 3000 });
      return;
    }

    if (formData.mobile.length !== 10 || isNaN(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number', { position: 'top-center', autoClose: 3000 });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.mobile,
          role: formData.role
        }
      );


      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');

      toast.success('Account created successfully!', { position: 'top-center', autoClose: 3000 });
      toast.info('Welcome to Bite Bliss!', { position: 'top-center', autoClose: 3000 });

      navigate('/delivery');

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Registration Failed: ${error.response.data.message}`, {
          position: "top-center",
          autoClose: 3000
        });
      } else {
        toast.error("Registration Failed", {
          position: "top-center",
          autoClose: 3000
        });
      }
    }
  };


  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Your Account</h2>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="text"
            name="mobile"
            placeholder="Enter 10-digit mobile number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Select Role</label>
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="restaurantowner">Restaurant Owner</option>
            <option value="chef">Chef</option>
            <option value="admin">Admin</option>
            <option value="deliverypartner">Delivery Partner</option>
          </select>
        </div>

        <div className="form-group password-group">
          <label>Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <div className="form-group password-group">
          <label>Confirm Password</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <button type="submit" className="signup-btn">Create Account</button>

        <p className="switch-auth">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
