/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';

function PartnerWithUs() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    cuisineType: '',
    address: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/partnerapp',formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      }
    );
      console.log('✅ Form submitted successfully:', response.data);
      setSubmitted(true);
      setFormData({
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        cuisineType: '',
        address: '',
        message: ''
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('❌ Error submitting the form:', error.response?.data || error.message);
    }
  };

  return (
    <div className="partner-container">
      {/* Hero Section */}
      <section className="partner-hero">
        <h1>Partner With Us</h1>
        <p>Join our platform and grow your restaurant with us.</p>
        <button onClick={() => document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' })}>
          Apply Now
        </button>
      </section>

      {/* Registration Form */}
      <section className="form-section">
        <h2>Fill Out Your Details</h2>
        {submitted ? (
          <div className="success-message">
            <h3>Thank you for your application!</h3>
            <p>We&apos;ll be in touch soon.</p>
          </div>
        ) : (
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
