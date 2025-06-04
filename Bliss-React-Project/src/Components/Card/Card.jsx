/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import axios from 'axios';

const Card = ({ filterType }) => {
  const [wishList, setWishList] = useState([]);
  const [hiddenCards, setHiddenCards] = useState([]);
  const [message, setMessage] = useState('');
  const [displayedRestaurants, setDisplayedRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allRestaurantsCount, setAllRestaurantsCount] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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
      }));

      setAllRestaurantsCount(restaurantList.length);

      if (filterType === "dining") {
        restaurantList = restaurantList.filter(r => r.diningAvailable);
      } else if (filterType === "delivery") {
        restaurantList = restaurantList.filter(r => r.deliveryAvailable);
      }

      setDisplayedRestaurants(restaurantList);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const wishlistRes = await axios.get("http://localhost:8000/wishlist", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => {
            if (err.response?.status === 401) {
              // Token is invalid or expired
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              toast.warn("Session expired. Please login again.", {
                position: "top-center",
                autoClose: 3000,
              });
              return { data: { wishlist: [] } };
            }
            throw err;
          });
          const wishIds = wishlistRes.data.wishlist.map(item => item._id || item.restaurantId || item.id);
          setWishList(wishIds);
        } catch (wishlistError) {
          if (wishlistError.response?.status === 403) {
            toast.error("🔒 Access Denied: Please check your account permissions", {
              position: "top-center",
              autoClose: 3000,
            });
          }
          console.error("Wishlist fetch error:", wishlistError);
        }

        try {
          const hiddenRes = await axios.get("http://localhost:8000/restauranthidden/gethidden", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => {
            if (err.response?.status === 401) {
              return { data: { hiddenRestaurants: [] } };
            }
            throw err;
          });
          const hiddenIds = (hiddenRes.data.hiddenRestaurants || []).map(rest => rest._id || rest.id);
          setHiddenCards(hiddenIds);
        } catch (hiddenError) {
          console.error("Error fetching hidden restaurants:", hiddenError);
        }
      } else {
        setWishList([]);
        setHiddenCards([]);
      }
    } catch (error) {
      toast.error("⚠️ Failed to load restaurants. Please try again later", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Restaurant fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  getRestaurantData();
}, [filterType]);
const toggleWishlist = async (id, e) => {
  e.stopPropagation();
  const token = localStorage.getItem('token');

  if (!token) {
    toast.warn("🔐 Please sign in to save favorites", {
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
      setWishList(res.data.wishlist.map(item => item._id || item.restaurantId || item.id));
      toast.success("❤️‍🩹 Removed from your favorites", {
        position: "top-center",
        autoClose: 2000,
      });
    } else {
      const res = await axios.post(
        "http://localhost:8000/wishlist/addtowishlist",
        { restaurantId: id },
        config
      );
      setWishList(res.data.wishlist.map(item => item._id || item.restaurantId || item.id));
      toast.success("🌟 Added to your favorites!", {
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
      toast.error("⛔ Account restriction: Cannot modify favorites", {
        position: "top-center",
        autoClose: 3000,
      });
    } else {
      toast.error("⚠️ Failed to update favorites. Please try again", {
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

  if (!token) {
    toast.warn("🔐 Please sign in to hide restaurants", {
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
      const hiddenIds = (res.data.hiddenRestaurants || []).map(rest => rest._id || rest.id);
      setHiddenCards(hiddenIds);
      toast.success("👀 Restaurant is now visible in your feed", {
        position: "top-center",
        autoClose: 2000,
      });
    } else {
      const res = await axios.post("http://localhost:8000/restauranthidden/hide", { restaurantId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const hiddenIds = (res.data.hiddenRestaurants || []).map(rest => rest._id || rest.id);
      setHiddenCards(hiddenIds);
      toast.success("👋 Restaurant hidden from your view", {
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
    } else {
      toast.error("⚠️ Couldn't update visibility settings", {
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

        {message && <div className="notification">{message}</div>}

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
              const isDelivering = restaurant.deliveryAvailable;

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
                  className="restaurant-card"
                  onClick={() => handleCardClick(restaurant.id)}
                >
                  <div className="card-content">
                    {!isDelivering && (
                      <div className="delivery-unavailable-banner">
                        <p>🚫 Currently Not Available</p>
                      </div>
                    )}
                  </div>

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

                  <div className="card-content">
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
              <img src="/Icons/fastfood.png" alt="end-result" className='end-img'/>
              <p className="end-message">You&apos;ve reached the end of the list!</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Card;