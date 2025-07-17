/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserContext } from '../Components/UserContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
   const { login } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/user/login`, {
      email: formData.email,
      password: formData.password
    });

    const { token, user } = response.data;
    login({ ...user, token }); 

    toast.success('Login successful!', {
      position: "top-center",
      autoClose: 3000
    });
    toast.info('Welcome back to Bite Bliss!', {
      position: "top-center",
      autoClose: 3000
    });

    navigate('/delivery');
  } catch (error) {
    toast.error("Login Failed. Please check your credentials.", {
      position: "top-center",
      autoClose: 3000
    });
  }
};

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h2>Welcome back to <span className="highlight">Bite Bliss</span></h2>
        <p className="login-subtext">Login to continue your culinary journey.</p>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group password-group">
          <label htmlFor="password">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="toggle-password-btn"
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <button type="submit" className="login-btn">Login</button>

        <p className="switch-auth">
          Don&apos;t have an account? <Link to="/signup">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
