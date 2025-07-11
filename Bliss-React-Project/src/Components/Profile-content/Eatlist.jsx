/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { FiHeart, FiMapPin, FiStar, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Eatlist = () => {
  const { bookmarkedRestaurants, removeFromEatlist, user } = useContext(UserContext);
  const [eatlistRestaurants, setEatlistRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEatlistRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user) {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view your Eatlist');
          setEatlistRestaurants(bookmarkedRestaurants || []);
          return;
        }

        const res = await axios.get('http://localhost:8000/wishlist', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        });
        
        if (res.data && res.data.wishlist) {
          setEatlistRestaurants(res.data.wishlist);
        } else {
          setEatlistRestaurants([]);
        }
      } else {
        setEatlistRestaurants(bookmarkedRestaurants || []);
      }
    } catch (err) {
      console.error('Failed to load eatlist', err);
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        toast.error('Please log in to view your Eatlist');
      } else {
        toast.error('Failed to load your Eatlist. Showing local bookmarks.');
      }

      setEatlistRestaurants(bookmarkedRestaurants || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEatlistRestaurants();
  }, [user]);

  const handleRemoveFromEatlist = async (restaurantId) => {
    try {
      if (user) {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to modify your Eatlist');
          return;
        }

        await axios.delete('http://localhost:8000/wishlist/removefromwishlist', {
          data: { restaurantId },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
      }

      setEatlistRestaurants(prev => prev.filter(r => r._id !== restaurantId));
      if (removeFromEatlist) removeFromEatlist(restaurantId);

      toast.success('Removed from Eatlist!');
    } catch (err) {
      console.error('Failed to remove from eatlist', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        toast.error('Please log in to modify your Eatlist');
      } else {
        toast.error('Failed to remove restaurant. Please try again.');
      }
    }
  };

  const displayedRestaurants = eatlistRestaurants.length > 0
    ? eatlistRestaurants
    : bookmarkedRestaurants || [];

  if (loading) {
    return <div className="eatlist-container">Loading your eatlist...</div>;
  }

  return (
    <div className="eatlist-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="eatlist-title">Your Eatlist 🍽️</h2>
      {displayedRestaurants.length === 0 ? (
        <div className="eatlist-empty">
          <FiHeart size={48} />
          <p>Your Eatlist is empty. Start bookmarking your favorite restaurants!</p>
        </div>
      ) : (
        <div className="eatlist-grid">
          {displayedRestaurants.map((restaurant) => (
            <div className="eatlist-card" key={restaurant._id || restaurant.id}>
              <img
                src={restaurant.image || '/default-restaurant.jpg'}
                alt={restaurant.name}
                className="eatlist-card-img"
                loading="lazy"
              />
              <div className="eatlist-card-info">
                <h3>{restaurant.name}</h3>
                <div className="eatlist-card-meta">
                  {restaurant.cuisine?.length > 0 && (
                    <span className="eatlist-card-cuisine">
                      {restaurant.cuisine.join(", ")}
                    </span>
                  )}
                  {restaurant.rating && (
                    <span className="eatlist-card-rating">
                      <FiStar /> {restaurant.rating}
                    </span>
                  )}
                  {restaurant.distance && (
                    <span className="eatlist-card-distance">
                      📍 {restaurant.distance} away
                    </span>
                  )}
                  {(restaurant.deliveryAvailable || restaurant.diningAvailability) && (
                    <span className="eatlist-card-services">
                      {restaurant.deliveryAvailable && "🚚 Delivery "}
                      {restaurant.diningAvailability && "🍽️ Dining"}
                    </span>
                  )}
                  {restaurant.openHours && (() => {
                    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                    const today = days[new Date().getDay()];
                    const todayHours = restaurant.openHours[today];

                    return (
                      todayHours && (
                        <span className="eatlist-card-hours">
                          ⏰ {today.charAt(0).toUpperCase() + today.slice(1)}: {todayHours.open} - {todayHours.close}
                        </span>
                      )
                    );
                  })()}
                </div>

                {restaurant.location && (
                  <p className="eatlist-card-location">
                    <FiMapPin size={14} /> {restaurant.location}
                  </p>
                )}
                <div className="eatlist-card-actions">
                  <button
                    onClick={() => handleRemoveFromEatlist(restaurant._id || restaurant.id)}
                    aria-label={`Remove ${restaurant.name} from Eatlist`}
                  >
                    <FiTrash2 /> Remove
                  </button>
                  <Link
                    to={`/restaurantdetails/${restaurant._id || restaurant.id}`}
                    className="eatlist-view-btn"
                    aria-label={`View details for ${restaurant.name}`}
                  >
                    <FiExternalLink /> View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Eatlist;