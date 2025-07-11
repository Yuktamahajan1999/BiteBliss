/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiInfo, FiFileText, FiAward } from 'react-icons/fi';

const About = () => {
  return (
    <div className="about-container">
      <header className="about-header">
        <h1><FiInfo className="header-icon" /> About Bite Bliss</h1>
        <p className="app-description">
          Serving delicious moments and connecting foodies with local restaurants across India since 2025.
        </p>
      </header>

      <div className="about-sections">
        <section className="about-card">
          <div className="card-header">
            <FiFileText className="card-icon" />
            <h2>Terms of Service</h2>
          </div>
          <div className="card-content">
            <p>
              Our Terms of Service explain how you can use the Bite Bliss platform.
              They cover your rights, responsibilities, and what you can expect from us.
            </p>
            <ul className="terms-highlights">
              <li>Creating and managing your account</li>
              <li>Ordering, delivery, and payment terms</li>
              <li>Community conduct and fair usage</li>
              <li>Legal disclaimers and service limits</li>
            </ul>
            <Link to="/terms-of-service" className="view-terms-btn">
              Read Full Terms <FiExternalLink />
            </Link>
          </div>
        </section>

        <section className="about-card">
          <div className="card-header">
            <FiInfo className="card-icon" />
            <h2>App Version</h2>
          </div>
          <div className="card-content">
            <div className="version-info">
              <div className="version-item">
                <span className="version-label">Current Version:</span>
                <span className="version-value">1.0</span>
              </div>
            </div>
            <div className="update-notice">
              <p>
                <strong>What&apos;s New:</strong> Live delivery tracking, quicker checkout, and exclusive tie-ups with local Indian restaurants.
              </p>
              <button className="update-btn">
                Check for Updates
              </button>
            </div>
          </div>
        </section>

        <section className="about-card">
          <div className="card-header">
            <FiAward className="card-icon" />
            <h2>Licenses & Compliance</h2>
          </div>
          <div className="card-content">
            <div className="license-item">
              <h3>FSSAI License</h3>
              <p>FSSAI No: ABCD1234567</p>
            </div>
            <div className="license-item">
              <h3>GST Registration</h3>
              <p>GSTIN: 22ABCDE1234F1Z5</p>
            </div>
            <div className="license-item">
              <h3>Data Privacy Compliance</h3>
              <p>We comply with the Digital Personal Data Protection Act (DPDPA), 2023</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="about-footer">
        <p>© 2025 Bite Bliss India. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
};

export default About;
