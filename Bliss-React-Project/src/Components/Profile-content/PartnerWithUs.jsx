/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PartnerWithUs() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    cuisineType: '',
    address: '',
    message: '',
    status: 'pending'
  });

  const [applicationStatus, setApplicationStatus] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'cuisineType' ? value.split(',').map(item => item.trim()) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/partnerapp`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplicationStatus('pending');
      setFormData({
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        cuisineType: '',
        address: '',
        message: '',
        status: 'pending'
      });

    } catch (error) {
      console.error('Error submitting the form:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const getApproveApplication = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        const modalSeen = localStorage.getItem(`partnerModalSeen_${userId}`);

        if (modalSeen === 'true' || role !== 'owner') return;

        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/partnerapp/getApproveApp`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.status === 'accepted') {
          localStorage.setItem(`partnerModalSeen_${userId}`, 'true');
          setShowModal(true);
          setApplicationStatus('accepted');
        }
      } catch (err) {
        console.log('No approved application found:', err.response?.data?.message || err.message);
      }
    };

    getApproveApplication();
  }, []);

  const handleModalClose = () => {
    setShowModal(false);
    const userId = localStorage.getItem('userId');
    localStorage.setItem(`partnerModalSeen_${userId}`, 'true');
  };

  const handleModalContinue = () => {
    const userId = localStorage.getItem('userId');
    localStorage.setItem(`partnerModalSeen_${userId}`, 'true');
    navigate('/restaurant-profile');
  };
  useEffect(() => {
    const checkIfAlreadyApplied = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (role !== 'owner') return;
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/partnerapp/getpartnerapp`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.length > 0) {
          const application = res.data[0];
          setApplicationStatus(application.status);
        }
      } catch (err) {
        console.log('Check failed:', err.message);
      }
    };

    checkIfAlreadyApplied();
  }, []);

  return (
    <div className="partner-container">
      <section className="partner-hero">
        <h1>Partner With Us</h1>
        <p>Join our platform and grow your restaurant with us.</p>
        <button onClick={() => document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' })}>
          Apply Now
        </button>
      </section>

      <section className="form-section">
        <h2>Fill Out Your Details</h2>

        {applicationStatus === 'pending' && (
          <div className="success-message">
            <h3>Thank you for your application!</h3>
            <p>We&apos;ll be in touch soon.</p>
          </div>
        )}

        {applicationStatus === 'rejected' && (
          <div className="rejected-message">
            <h3>We&apos;re sorry!</h3>
            <p>Your application was not approved. You may try again later.</p>
          </div>
        )}

        {applicationStatus !== 'pending' && applicationStatus !== 'rejected' && (
          <form onSubmit={handleSubmit} className="partner-form">
            <div>
              <label>Restaurant Name*</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Contact Person*</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Phone*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Cuisine Type*</label>
              <input
                type="text"
                name="cuisineType"
                value={formData.cuisineType}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Restaurant Address*</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Tell us about your restaurant*</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>
            <button type="submit">Submit Application</button>
          </form>
        )}
      </section>

      {showModal && (
        <div className="partner-modal-overlay">
          <div className="partner-modal-content">
            <h2>Application Approved!</h2>
            <p>Your application has been approved. Please complete your restaurant profile to go live.</p>
            <div className="partner-modal-buttons">
              <button className="partner-modal-primary" onClick={handleModalContinue}>
                Continue
              </button>
              <button className="partner-modal-secondary" onClick={handleModalClose}>
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="contact-section">
        <h2>Contact Us</h2>
        <p>Have any questions? Reach out to us:</p>
        <p>Email: <a href="mailto:team@bitebliss.com">team@bitebliss.com</a></p>
        <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
      </section>
    </div>
  );
}

export default PartnerWithUs;
