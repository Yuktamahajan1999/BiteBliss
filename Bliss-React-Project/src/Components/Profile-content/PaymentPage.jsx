/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  FaCreditCard,
  FaCheckCircle,
  FaMoneyBillWave
} from 'react-icons/fa';
import { SiPhonepe, SiGooglepay, SiAmazonpay } from 'react-icons/si';
import { Link } from 'react-router-dom';

const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [currentLink, setCurrentLink] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Get user and token from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const handleLinkClick = (link, e) => {
    e.stopPropagation();
    setCurrentLink(link);
    setShowModal(true);
  };

  const digitalWallets = [
    {
      id: 'google-pay',
      name: 'Google Pay',
      icon: <SiGooglepay size={24} color="#4285F4" />,
      description: 'Fast and secure UPI payments',
      link: 'https://pay.google.com'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: <SiPhonepe size={24} color="#5F259F" />,
      description: 'UPI, wallet or credit card',
      link: 'https://www.phonepe.com'
    },
    {
      id: 'amazon-pay',
      name: 'Amazon Pay',
      icon: <SiAmazonpay size={24} color="#FF9900" />,
      description: 'Pay with Amazon Pay balance',
      link: 'https://pay.amazon.com'
    }
  ];

  const creditOptions = [
    {
      id: 'credit-card',
      name: 'Credit/Debit Card',
      icon: <FaCreditCard size={24} />,
      description: 'Pay using Visa, Mastercard, Rupay, etc.'
    },
    {
      id: 'pay-later',
      name: 'Pay Later',
      icon: <SiAmazonpay size={24} color="#FF9900" />,
      description: 'Buy now, pay next month',
      link: 'https://pay.amazon.com/paylater'
    }
  ];

  const bankOptions = [
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <FaCreditCard size={24} />,
      description: 'Pay directly from your bank'
    }
  ];

  const codOption = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: <FaMoneyBillWave size={24} color="#10B981" />,
      description: 'Pay when you receive your order'
    }
  ];

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (selectedMethod === 'credit-card' && !cardDetails.number) {
      alert('Please enter card details');
      return;
    }

    if (!user || !token) {
      alert("User not logged in.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:8000/payment',
        {
          userId: user.id,
          method: selectedMethod,
          cardDetails: selectedMethod === 'credit-card' ? cardDetails : null,
          type: 'order'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Payment successful! Transaction ID: " + response.data.payment.transactionId);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentSection = (title, methods) => (
    <div className="payment-section">
      <h3 className="section-title">{title}</h3>
      <div className="payment-methods">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <div className="method-icon">
              {method.icon}
            </div>
            <div className="method-info">
              <h4>{method.name}</h4>
              <p>{method.description}</p>
              {method.link && (
                <button
                  className="add-link-button"
                  onClick={(e) => handleLinkClick(method.link, e)}
                >
                  Add/Link
                </button>
              )}
            </div>
            {selectedMethod === method.id && (
              <FaCheckCircle className="check-icon" color="#4CAF50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h2>Payment Method</h2>
          <p>Choose how you want to pay</p>
        </div>

        {renderPaymentSection("Digital Wallets", digitalWallets)}
        {renderPaymentSection("Credit/Debit Cards", creditOptions)}
        {renderPaymentSection("Net Banking", bankOptions)}
        {renderPaymentSection("Other Options", codOption)}

        {selectedMethod === 'credit-card' && (
          <div className="card-form">
            <h3>Enter Card Details</h3>
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  maxLength="16"
                />
              </div>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    maxLength="5"
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    maxLength="3"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {showModal && (
          <div className="redirect-modal">
            <p>You&apos;ll be redirected to set up your payment method. Continue?</p>
            <div className="modal-actions">
              <button className="modal-confirm" onClick={() => {
                window.open(currentLink, '_blank', 'noopener,noreferrer');
                setShowModal(false);
              }}>
                Continue
              </button>
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="payment-actions">
          <Link to="/cart" className="back-button">Back</Link>
          <button
            className="pay-button"
            onClick={handlePaymentSubmit}
            disabled={!selectedMethod || loading}
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
