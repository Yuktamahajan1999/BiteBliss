/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { FaCoins, FaUtensils, FaGift, FaBirthdayCake } from 'react-icons/fa';

const Rewards = () => {
  const [selectedReward, setSelectedReward] = useState(null);

  const rewards = [
    {
      title: 'Earn Points',
      desc: '1 point per ₹100 spent',
      points: '100 pts',
      icon: <FaCoins />,
      extra: 'You earn points on every eligible order placed through Bite Bliss.',
    },
    {
      title: 'Free Lunch',
      desc: 'Redeem for free lunch',
      points: '500 pts',
      icon: <FaUtensils />,
      extra: 'Enjoy a complimentary lunch from partner restaurants once you hit 500 points.',
    },
    {
      title: 'Gift Vouchers',
      desc: 'Discount codes for restaurants',
      points: '750 pts',
      icon: <FaGift />,
      extra: 'Use your points to grab restaurant gift vouchers and save more.',
    },
    {
      title: 'Birthday Treat',
      desc: 'Free dessert on your birthday',
      points: 'Birthday',
      icon: <FaBirthdayCake />,
      extra: 'Celebrate your birthday with a surprise dessert from us!',
    },
  ];

  return (
    <div className="rewards-section">
      <h1 className="rewards-title">Loyalty Rewards</h1>
      <p className="rewards-subtitle">Earn points on every order</p>

      <div className="rewards-grid">
        {rewards.map((reward, i) => (
          <div
            className={`reward-card ${selectedReward?.title === reward.title ? 'selected-card' : ''}`}
            key={i}
            onClick={() => setSelectedReward(reward)}
          >
            <div className="reward-header">
              <span className="reward-icon">{reward.icon}</span>
              <span className="reward-points">{reward.points}</span>
            </div>
            <h3 className="reward-name">{reward.title}</h3>
            <p className="reward-description">{reward.desc}</p>
          </div>
        ))}
      </div>

      {selectedReward && (
        <div className="reward-details">
          <h3>{selectedReward.title}</h3>
          <p>{selectedReward.extra}</p>
          <button onClick={() => setSelectedReward(null)} className="rewards-btn">Close</button>
        </div>
      )}

      <div className="rewards-cta">
        <h2>Ready to Get Rewarded?</h2>
        <button className="rewards-btn">View My Points</button>
      </div>
    </div>
  );
};

export default Rewards;
