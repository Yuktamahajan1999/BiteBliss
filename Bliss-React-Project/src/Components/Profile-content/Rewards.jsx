/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import { toast } from 'react-toastify';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [ratingProgress, setRatingProgress] = useState({
    current: 0,
    required: 2,
    rewarded: false
  });

  const getIconComponent = (iconKey) => {
    const Icon = FaIcons[iconKey];
    return Icon ? <Icon /> : null;
  };

  const fetchRewards = async () => {
    try {
      const res = await axios.get("http://localhost:8000/rewards", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRewards(res.data);
    } catch {
      toast.error("Failed to load rewards");
    }
  };

  const fetchUserPoints = async () => {
    try {
      const res = await axios.get("http://localhost:8000/rewards/userpoints", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setUserPoints(res.data.points);
      setRedeemedRewards(res.data.redeemedRewards || []);
      if (res.data.ratingProgress) {
        setRatingProgress(res.data.ratingProgress);
      }
    } catch (error) {
      toast.error("Failed to load points");
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchUserPoints();
  }, []);

  const redeemReward = async (reward) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        "http://localhost:8000/rewards/redeemedReward",
        { rewardTitle: reward.title },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Redeemed: ${reward.title}`);
      setSelectedReward(null);
      fetchUserPoints();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to redeem reward");
    }
  };

  return (
    <div className="rewards-section">
      <h1 className="rewards-title">Loyalty Rewards</h1>
      <p className="rewards-subtitle">Earn points on every order</p>
      <div className="rating-progress">
        <h4>Rating Progress</h4>
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${Math.min(100, (ratingProgress.current / ratingProgress.required) * 100)}%` }}
          ></div>
        </div>
        <p>
          {ratingProgress.current}/{ratingProgress.required} ratings completed
          {ratingProgress.rewarded && " - Reward earned!"}
        </p>
      </div>
      <div className="rewards-grid">
        {rewards.map((reward) => (
          <div
            className={`reward-card ${selectedReward?.title === reward.title ? 'selected-card' : ''}`}
            key={reward.title}
            onClick={() => setSelectedReward(reward)}
          >
            <div className="reward-header">
              <span className="reward-icon">{getIconComponent(reward.icon)}</span>
              <span className="reward-points">{reward.points} pts</span>
            </div>
            <h3 className="reward-name">{reward.title}</h3>
            <p className="reward-description">{reward.desc}</p>
            <div className="reward-status">
              {redeemedRewards.includes(reward.title)
                ? "Redeemed"
                : userPoints >= reward.points
                  ? "Unlocked"
                  : "Locked"}
            </div>
          </div>
        ))}
      </div>
      {selectedReward && (
        <div className="reward-details">
          <h3>{selectedReward.title}</h3>
          <p>{selectedReward.extra}</p>
          <button
            className="rewards-btn"
            onClick={() => redeemReward(selectedReward)}
            disabled={userPoints < selectedReward.points || redeemedRewards.includes(selectedReward.title)}
          >
            {redeemedRewards.includes(selectedReward.title)
              ? "Redeemed"
              : userPoints >= selectedReward.points
                ? "Redeem Reward"
                : "Not enough points"}
          </button>
          <button onClick={() => setSelectedReward(null)} className="rewards-btn">
            Close
          </button>
        </div>
      )}
      <div className="rewards-cta">
        <h2>You have {userPoints} points</h2>
        <button className="rewards-btn" onClick={fetchUserPoints}>Refresh Points</button>
      </div>
    </div>
  );
};

export default Rewards;