/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';

const ClaimGiftCard = () => {
  const [cardCode, setCardCode] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const isValid = cardCode.length === 16 && pin.length === 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        'http://localhost:8000/giftcard/claim',
        { cardCode, pin },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(response.data.message);
      setCardCode('');
      setPin('');
    } catch (error) {
      alert(error.response?.data?.error || "An error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="claim-gift-card-container">
      <h2>🎁 Redeem Gift Card</h2>
      {success && <p className="claim-success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          maxLength="16"
          placeholder="Card Code"
          value={cardCode}
          onChange={(e) => setCardCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        />
        <div className="claim-pin-input">
          <input
            type={showPin ? 'text' : 'password'}
            maxLength="6"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          />
          <button type="button" onClick={() => setShowPin(!showPin)}>
            {showPin ? '🙈' : '👁️'}
          </button>
        </div>

        <button type="submit" disabled={!isValid || loading}>
          {loading ? 'Processing...' : 'Claim'}
        </button>
      </form>
    </div>
  );
};

export default ClaimGiftCard;
