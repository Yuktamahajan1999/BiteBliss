/* eslint-disable no-unused-vars */
import React from 'react';
import { FiExternalLink } from 'react-icons/fi';

const TermsOfService = () => {
  return (
    <div className="terms-container">
      <header className="terms-header">
        <h1>Terms of Service</h1>
        <p className="last-updated">Welcome to Bite Bliss! Please review our Terms of Service carefully.</p>
      </header>

      <div className="terms-content">
        <section className="terms-section">
          <h2>Acceptance of Terms</h2>
          <p>By accessing or using Bite Bliss, you agree to be bound by these Terms. If you disagree with any part of the terms, please refrain from using our platform.</p>
        </section>

        <section className="terms-section">
          <h2>Services Description</h2>
          <p>Bite Bliss provides a digital platform that connects customers with restaurants and food providers. Please note that we don&apos;t prepare food ourselves or guarantee the quality or timeliness of third-party services.</p>
        </section>

        <section className="terms-section">
          <h2>User Accounts</h2>
          <ul>
            <li>You must provide accurate and up-to-date registration information</li>
            <li>Keep your Bite Bliss login credentials secure and confidential</li>
            <li>Accounts are personal and non-transferable</li>
            <li>Bite Bliss reserves the right to suspend accounts found engaging in suspicious or unauthorized activities</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Ordering & Payments</h2>
          <ul>
            <li>All prices listed on Bite Bliss are inclusive of applicable taxes</li>
            <li>We support multiple payment methods as displayed on the platform</li>
            <li>Restaurants manage their own menu pricing — Bite Bliss does not control these prices</li>
            <li>Promo codes issued by Bite Bliss are subject to expiration dates and specific terms</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Cancellations & Refunds</h2>
          <p>Restaurant-specific cancellation policies apply. If eligible, refunds are processed to the original payment method within 7–10 business days.</p>
        </section>

        <section className="terms-section">
          <h2>Content Policy</h2>
          <p>By uploading content to Bite Bliss (e.g., reviews, photos), you grant us the right to use it for operational and promotional purposes. The following content is strictly prohibited:</p>
          <ul>
            <li>Abusive, hateful, or defamatory material</li>
            <li>Unauthorized commercial advertising</li>
            <li>Copyrighted content without permission</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Limitation of Liability</h2>
          <p>Bite Bliss is not liable for:</p>
          <ul>
            <li>Issues related to food quality, hygiene, or delivery delays from third-party vendors</li>
            <li>Service disruptions due to technical or natural causes beyond our control</li>
            <li>Consequential damages, including loss of data or revenue</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be handled in the courts of New Delhi.</p>
        </section>

        <div className="contact-legal">
          <h3>Legal Questions?</h3>
          <a href="mailto:legal@bitebliss.com" className="legal-link">
            Contact our legal team <FiExternalLink className="external-icon" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
