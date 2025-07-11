/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../UserContext';
import { toast } from 'react-toastify';

const Rating = () => {
  const navigate = useNavigate();
  const [ratingCount, setRatingCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [justEarnedReward, setJustEarnedReward] = useState(false);
  const { user } = useUser();
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = user?.token || localStorage.getItem('token');

      if (!token) {
        toast.error("Login required to see your rating progress.");
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      try {
        const ratingsRes = await axios.get(`http://localhost:8000/rating/getRating`, config);
        const ratings = ratingsRes.data?.data || [];
        const count = ratings.length;
        setRatingCount(count);

        try {
          const pointsRes = await axios.get(`http://localhost:8000/rewards/userpoints`, config);
          const rewardGiven = pointsRes.data?.ratingProgress?.rewarded || false;

          if (count === 2 && !rewardGiven) {
            setJustEarnedReward(true);
            setShowModal(true);
          } else if (count > 2) {
            setJustEarnedReward(false);
          }
        } catch (pointsError) {
          console.error('Points fetch error:', pointsError);
          if (pointsError.response?.status === 401) {
            throw pointsError;
          }
          toast.error(pointsError.response?.data?.message || "Failed to fetch points data");
        }
      } catch (ratingsError) {
        console.error('Ratings fetch error:', ratingsError);
        throw ratingsError;
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        if (user?.setUser) user.setUser(null);
        toast.error("Session expired. Please login again.");
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleOkayClick = () => {
    setShowModal(false);
    navigate('/profile');
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="rating-container">
      {showModal && (
        <div className="rating-modal-overlay">
          <div className="rating-modal">
            <div className="rating-modal-content">
              <h2 className="rating-modal-title">🎉 You&apos;re on your way!</h2>
              <p className="rating-modal-message">
                {justEarnedReward
                  ? `🎁 Congrats! You just earned 50 reward points for rating!`
                  : ratingCount < 5
                    ? `Rate ${5 - ratingCount} more ${5 - ratingCount === 1 ? 'delivery' : 'deliveries'} to unlock another reward!`
                    : `Thanks for rating! You've unlocked a reward.`}
              </p>
              <button onClick={handleOkayClick} className="rating-modal-button">
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="food-boy-icon">
        <img src="/Icons/food-boy.webp" alt="Food Delivery Icon" className="food-boy" />
      </div>

      <hr className="rating-divider" />

      <div className="rating-intro-container">
        <div className="rating-header">
          <img src="/Icons/rating.png" alt="Rating Icon" className="tip-icon" />
        </div>
        <div className="rating-intro">
          <h2>Understanding your rating</h2>
          <p className="intro-text">
            Your <strong>Bite Bliss</strong> rating reflects your interactions with delivery partners.
            A high rating means smoother deliveries, exclusive perks, and happier experiences!
          </p>
        </div>
      </div>

      <hr className="rating-divider" />

      <div className="tip-card-container">
        <div className="tip-card">
          <h4>Short wait times</h4>
          <p>
            Ensure your address and instructions are accurate to minimize drop-off delays and make the
            delivery smooth and efficient.
          </p>
        </div>
        <div>
          <img src="/Icons/delivery-bike.png" alt="Bike Icon" className="tip-icon" />
        </div>
      </div>

      <hr className="rating-divider" />

      <div className="courtesy-container">
        <div>
          <img src="/Icons/food-recieve.jpg" alt="Receiving Food" className="tip-icon" />
        </div>
        <div className="tip-card">
          <h4>Courtesy Matters</h4>
          <p>A smile or thank you makes a delivery partner’s day brighter.</p>
        </div>
      </div>

      <hr className="rating-divider" />

      <div className="generosity-container">
        <div className="tip-card">
          <h4>Generosity</h4>
          <p>
            If possible, offer a tip to show appreciation for the dedication of the delivery partner
            and their effort in delivering your meal.
          </p>
        </div>
        <div>
          <img src="/Icons/food-tip.jpg" alt="Tipping" className="tip-icon" />
        </div>
      </div>

      <hr className="rating-divider" />

      <div className="rating-calculation">
        <div>
          <img src="/Icons/user-rating.avif" alt="User Rating Icon" className="tip-icon" />
        </div>
        <div className="tip-card">
          <h4>How Your Rating is Calculated</h4>
          <p>
            Your rating is the average of scores given by delivery partners after completing at least
            five orders, reflecting your overall interaction and impact on their experience.
          </p>
          <p>
            A high rating shows the joy you bring to each delivery experience—thanks for spreading
            positivity! Your thoughtful interactions inspire smiles and make Bite Bliss truly blissful.
          </p>
        </div>
      </div>

      <hr className="rating-divider" />

      <div className="btn-container">
        <button
          className="rating-btn"
          aria-label="Confirm and close rating section"
          onClick={handleOkayClick}
        >
          Okay
        </button>
      </div>
    </div>
  );
};

export default Rating;
