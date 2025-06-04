/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { FaGift } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GiftCardPage = () => {
  const [occasion, setOccasion] = useState('Birthday');
  const [amount, setAmount] = useState(1000);
  const [message, setMessage] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [pin, setPin] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  const occasions = ['Birthday', 'Anniversary', 'Thank You'];
  const amounts = [100, 200, 500, 1000];

  const generateCard = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post(
        'http://localhost:8000/giftcard/create',
        { amount, occasion, message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { cardCode, pin, expirationDate } = res.data;

      setCardCode(cardCode);
      setPin(pin);
      setExpirationDate(expirationDate);

      toast.success(`Card Created!\nCode: ${cardCode}\nPIN: ${pin}\nExpires: ${new Date(expirationDate).toLocaleDateString()}`, {
        autoClose: 5000,
        position: 'top-right',
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create gift card', {
        autoClose: 5000,
        position: 'top-right',
      });
    }
  };

  return (
    <div className="gift-card">
      <div className="header">
        <FaGift className="gift-icon" />
        <h1>Create a Gift Card</h1>
        <p>Share the joy of dining with friends and family</p>
      </div>

      {cardCode && pin && expirationDate ? (
        <div className="card-result">
          <h2>Your Gift Card</h2>
          <p><strong>Code:</strong> {cardCode}</p>
          <p><strong>PIN:</strong> {pin}</p>
          <p><strong>Amount:</strong> ₹{amount}</p>
          <p><strong>Occasion:</strong> {occasion}</p>
          <p><strong>Expires:</strong> {new Date(expirationDate).toLocaleDateString()}</p>
          {message && <p className="card-message">&quot;<i>{message}</i>&quot;</p>}
          <button
            onClick={() => {
              setCardCode('');
              setPin('');
              setExpirationDate('');
              setMessage('');
            }}
            className="new-card-btn"
          >
            Create Another
          </button>
        </div>
      ) : (
        <form onSubmit={generateCard} className="card-form">
          <div className="form-group">
            <label>Occasion:</label>
            <div className="occasion-options">
              {occasions.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  className={occasion === occ ? 'active' : ''}
                  onClick={() => setOccasion(occ)}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Amount (₹):</label>
            <div className="amount-options">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={amount === amt ? 'active' : ''}
                  onClick={() => setAmount(amt)}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Personal Message (optional):</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note..."
              maxLength="100"
            />
          </div>

          <button type="submit" className="generate-btn">
            Generate Gift Card
          </button>
        </form>
      )}
    </div>
  );
};

export default GiftCardPage;
