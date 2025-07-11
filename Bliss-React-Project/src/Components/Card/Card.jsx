/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import axios from 'axios';
import ExploreOptions from '../Footer/ExploreOptions';

const useQuery = () => new URLSearchParams(useLocation().search);

const Card = ({ filterType }) => {
  const [wishList, setWishList] = useState([]);
  const [hiddenCards, setHiddenCards] = useState([]);
  const [message, setMessage] = useState('');
  const [displayedRestaurants, setDisplayedRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allRestaurantsCount, setAllRestaurantsCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'));

  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  function isRestaurantOpen(openHours) {
    if (!openHours) return false;

    const days = [
      "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
    ];
    const now = new Date();
    const day = days[now.getDay()];
    const todayHours = openHours[day];

    if (!todayHours || !todayHours.open || !todayHours.close) return false;

    function parseTime(timeStr) {
      if (!timeStr) return null;
      const timePart = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!timePart) return null;

      let hours = parseInt(timePart[1], 10);
      const minutes = parseInt(timePart[2], 10);
      const modifier = timePart[3] ? timePart[3].toLowerCase() : null;

      if (modifier === 'pm' && hours !== 12) {
        hours += 12;
      } else if (modifier === 'am' && hours === 12) {
        hours = 0;
      }

      return { hours, minutes };
    }

    const openTime = parseTime(todayHours.open);
    const closeTime = parseTime(todayHours.close);

    if (!openTime || !closeTime) return false;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openTime.hours * 60 + openTime.minutes;
    const closeMinutes = closeTime.hours * 60 + closeTime.minutes;

    if (closeMinutes < openMinutes) {
      return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
    } else {
      return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
    }
  }

useEffect(() => {
  const getRestaurantData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/restaurant/getAllrestaurant");
      const data = res.data?.data || [];

      let restaurantList = data.map(restaurant => ({
        ...restaurant,
        id: restaurant._id,
        deliveryAvailable: restaurant.deliveryAvailable === true,
        diningAvailable: restaurant.diningAvailability === true,
        isOpen: isRestaurantOpen(restaurant.openHours)
      }));

      setAllRestaurantsCount(restaurantList.length);

      if (filterType === "dining") {
        restaurantList = restaurantList.filter(r => r.diningAvailable);
      } else if (filterType === "delivery") {
        restaurantList = restaurantList.filter(r => r.deliveryAvailable);
      }

      setDisplayedRestaurants(restaurantList);

      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (token && user?.role === 'user') {
        try {
          const wishlistRes = await axios.get("http://localhost:8000/wishlist", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => {
            if (err.response?.status === 403 || err.response?.status === 401) {
              return { data: { wishlist: [] } };
            }
            throw err;
          });
          const wishIds = (wishlistRes.data.wishlist || []).map(item => item._id);
          setWishList(wishIds);
        } catch (wishlistError) {
          console.log(wishlistError);
          setWishList([]);
        }

        try {
          const hiddenRes = await axios.get("http://localhost:8000/restauranthidden/gethidden", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => {
            if (err.response?.status === 403 || err.response?.status === 401) {
              return { data: { hiddenRestaurants: [] } };
            }
            throw err;
          });
          const hiddenIds = (hiddenRes.data.hiddenRestaurants || []).map(rest => rest._id);
          setHiddenCards(hiddenIds);
        } catch (hiddenError) {
          console.log(hiddenError);
          setHiddenCards([]);
        }
      } else {
        setWishList([]);
        setHiddenCards([]);
      }
    } catch (error) {
      toast.error("Failed to load restaurants. Please try again later", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  getRestaurantData();
}, [filterType]);

  const toggleWishlist = async (id, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token) {
      toast.warn("Please sign in to save favorites", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (user?.role !== 'user') {
      toast.info("Only regular users can save favorites", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    const isWished = wishList.includes(id);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (isWished) {
        const res = await axios.delete(
          "http://localhost:8000/wishlist/removefromwishlist",
          {
            ...config,
            data: { restaurantId: id }
          }
        );
        setWishList(prev => prev.filter(itemId => itemId !== id));
        toast.success("Removed from your favorites", {
          position: "top-center",
          autoClose: 2000,
        });
      } else {
        const res = await axios.post(
          "http://localhost:8000/wishlist/addtowishlist",
          { restaurantId: id },
          config
        );
        setWishList(prev => [...prev, id]);
        toast.success("Added to your favorites!", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.warn("Session expired. Please login again.", {
          position: "top-center",
          autoClose: 3000,
        });
      } else if (error.response?.status === 403) {
        toast.error("Account restriction: Cannot modify favorites", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.error("Failed to update favorites. Please try again", {
          position: "top-center",
          autoClose: 3000,
        });
      }
      console.error("Wishlist Error:", error.response?.data || error.message);
    }
  };

  const toggleVisibility = async (id, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token) {
      toast.warn("Please sign in to hide restaurants", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (user?.role !== 'user') {
      toast.info("Only regular users can hide restaurants", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    const isHidden = hiddenCards.includes(id);
    try {
      if (isHidden) {
        const res = await axios.delete("http://localhost:8000/restauranthidden/unhide", {
          headers: { Authorization: `Bearer ${token}` },
          data: { restaurantId: id }
        });
        setHiddenCards(prev => prev.filter(itemId => itemId !== id));
        toast.success("Restaurant is now visible in your feed", {
          position: "top-center",
          autoClose: 2000,
        });
      } else {
        const res = await axios.post("http://localhost:8000/restauranthidden/hide",
          { restaurantId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHiddenCards(prev => [...prev, id]);
        toast.success("Restaurant hidden from your view", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.warn("Session expired. Please login again.", {
          position: "top-center",
          autoClose: 3000,
        });
      } else if (error.response?.status === 403) {
        toast.error("Account restriction: Cannot modify visibility settings", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.error("Couldn't update visibility settings", {
          position: "top-center",
          autoClose: 3000,
        });
      }
      console.error("Visibility Error:", error.response?.data || error.message);
    }
  };
  const handleCardClick = (id) => {
    navigate(`/restaurantdetails/${id}`);
  };

  return (
    <div className={`card-container ${filterType === 'dining' ? 'dining-page' : ''}`}>
      <div className="Restaurant-Card">
        <div className="restaurant-nearbyme">
          <h2 className="restaurant-nearme">Restaurants Near Me</h2>
        </div>
        <div className="restaurant-card-container">
          {isLoading ? (
            <div className="restaurant-card loading-card">
              <div className="loading-content">
                <CircularProgress className="loading-icon" />
                <p>Loading delicious options...</p>
              </div>
            </div>
          ) : displayedRestaurants.length === 0 ? (
            <div className="no-restaurants-message">
              <p>No restaurants found matching your criteria.</p>
            </div>
          ) : (
            displayedRestaurants.map(restaurant => {
              const isWished = wishList.includes(restaurant.id);
              const isHidden = hiddenCards.includes(restaurant.id);

              if (isHidden) {
                return (
                  <div key={restaurant.id} className="restaurant-card hidden-message-card">
                    <p>
                      <strong>{restaurant.name}</strong> is currently hidden from your list.<br />
                      Click the 👁️ icon below to rediscover its tasty delights 🍽️
                    </p>
                    <VisibilityIcon
                      className="visibility-icon"
                      onClick={(e) => toggleVisibility(restaurant.id, e)}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={restaurant.id}
                  className={`restaurant-card ${!restaurant.isOpen ? 'restaurant-closed' : ''}`}
                  onClick={() => handleCardClick(restaurant.id)}
                >
                  <div className="card-content">
                    {!restaurant.isOpen && (
                      <div className="delivery-unavailable-banner">
                        <p>Currently Not Available</p>
                      </div>
                    )}
                    <div className="hide-fav-icon">
                      <BookmarkIcon
                        className={`bookmark-icon ${isWished ? "favourited" : "notfavorited"}`}
                        onClick={(e) => toggleWishlist(restaurant.id, e)}
                      />
                      <VisibilityOffIcon
                        className="visibility-icon"
                        onClick={(e) => toggleVisibility(restaurant.id, e)}
                      />
                    </div>

                    <img
                      src={restaurant.image.startsWith("http") ? restaurant.image : `/${restaurant.image}`}
                      alt={restaurant.name}
                      className="Restaurant-card-images"
                    />

                    <div className="time-distance">
                      <p className="time-distance-info">
                        <AccessAlarmIcon className="timer-icon" /> {restaurant.time}
                      </p>
                      {restaurant.distance && <p className="distance-info">{restaurant.distance}</p>}
                    </div>

                    <div className="name-rate">
                      <h3>{restaurant.name}</h3>
                      <div className="rating-icon">
                        <p className="rating">
                          {restaurant.rating} <StarIcon className="star-icon" />
                        </p>
                      </div>
                    </div>

                    <p className="cuisine-italic">
                      {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                    </p>
                    <hr className="restaurant-offer" />

                    {restaurant.offer && (
                      <div className="card-offers">
                        <img src="./Images/buy-now.gif" alt="buy now" className="buynow" />
                        <h6 className="restaurant-offers">{restaurant.offer}</h6>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!isLoading && displayedRestaurants.length > 0 && (
          <div className="end-message-container">
            <img src="/Icons/fastfood.png" alt="end-result" className='end-img' />
            <p className="end-message">You&apos;ve reached the end of the list!</p>
          </div>
        )}
      </div>
      <ExploreOptions />
    </div>
  );
};

export default Card;