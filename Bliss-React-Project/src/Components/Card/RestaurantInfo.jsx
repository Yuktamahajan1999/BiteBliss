/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import CallIcon from '@mui/icons-material/Call';
import DirectionsIcon from '@mui/icons-material/Directions';
import DiningIcon from '@mui/icons-material/Restaurant';
import CollectionsIcon from '@mui/icons-material/Collections';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlaceIcon from '@mui/icons-material/Place';
import GavelIcon from '@mui/icons-material/Gavel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentIcon from '@mui/icons-material/Payment';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import { toast } from 'react-toastify';

const RestaurantInfo = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const establishmentYear = new Date().getFullYear();
  const [serviceAvailability, setServiceAvailability] = useState({
    dining: false,
    delivery: false
  });
  const [isRaining] = useState(false);
  const [petAllowed, setPetAllowed] = useState(false);
  const [hideRestaurant, setHideRestaurant] = useState(false);
  const [wishList, setWishList] = useState([]);
  const [isWished, setIsWished] = useState(false);
  const [Restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpenNow, setIsOpenNow] = useState(true);

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
    const getData = async () => {
      try {
        const restaurantRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/restaurant/getRestaurantById?id=${id}`
        );
        let data = null;
        if (restaurantRes.data) {
          data = restaurantRes.data;
          setRestaurant(data);
          setServiceAvailability({
            dining: data.diningAvailability,
            delivery: data.deliveryAvailable,
          });
          setPetAllowed(data.petAllow);
          setIsOpenNow(isRestaurantOpen(data.openHours));
        } else {
          setRestaurant(null);
          setError('Restaurant not found!');
          return;
        }

        let isHiddenForUser = false;
        if (token) {
          const user = JSON.parse(localStorage.getItem('user'));

          if (user?.role === 'user') {
            try {
              const wishlistRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
              }).catch(err => {
                if (err.response?.status === 403 || err.response?.status === 401) {
                  return { data: { wishlist: [] } };
                }
                throw err;
              });
              const wishlistIds = wishlistRes.data.wishlist.map(
                item => item.restaurantId || item._id || item.id
              );
              setWishList(wishlistIds);
              setIsWished(wishlistIds.includes(id));

              const hiddenRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/restauranthidden/gethidden`, {
                headers: { Authorization: `Bearer ${token}` }
              }).catch(err => {
                if (err.response?.status === 403 || err.response?.status === 401) {
                  return { data: { hiddenRestaurants: [] } };
                }
                throw err;
              });
              isHiddenForUser = (hiddenRes.data.hiddenRestaurants || []).some(
                rest => rest._id === id
              );
            } catch (err) {
              console.log(err);
            }
          }
        }
        setHideRestaurant(isHiddenForUser);
      } catch (err) {
        console.error(err);
        setRestaurant(null);
        setError('Failed to fetch restaurant details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [id, token]);

  const toggleWishlist = async () => {
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

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (isWished) {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/wishlist/removefromwishlist`, {
          ...config,
          data: { restaurantId: id }
        });
        setIsWished(false);
        setWishList(prev => prev.filter(itemId => itemId !== id));
        toast.success("Removed from favorites", {
          position: "top-center",
          autoClose: 2000,
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/wishlist/addtowishlist`,
          { restaurantId: id },
          config
        );
        setIsWished(true);
        setWishList(prev => [...prev, id]);
        toast.success("Added to favorites!", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorites. Please try again", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleHideRestaurant = async () => {
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

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/restauranthidden/hide`,
        { restaurantId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHideRestaurant(true);
      toast.success("Restaurant hidden from your view", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.error("Couldn't hide restaurant. Please try again", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleUnhideRestaurant = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role !== 'user') return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/restauranthidden/unhide`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { restaurantId: id }
      });
      setHideRestaurant(false);
      toast.success("Restaurant is now visible", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.error("Couldn't unhide restaurant. Please try again", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  if (loading) {
    return <div className="restaurant-info-loading">
      <div className="restaurant-info-spinner"></div>
      <p className="restaurant-info-loading-text">Loading restaurant info...</p>
    </div>;
  }

  if (error) {
    return (
      <div className="restaurant-info-error">
        <div className="restaurant-info-error-content">
          <img src="/Icons/error.png" alt="Error" className="restaurant-info-error-icon" />
          <h3>Oops!</h3>
          <p>{error}</p>
          <Link to="/" className="restaurant-info-back-link">Return to homepage</Link>
        </div>
      </div>
    );
  }

  if (!Restaurant) {
    return (
      <div className="restaurant-info-error">
        <div className="restaurant-info-error-content">
          <img src="/Icons/not-found.png" alt="Not found" className="restaurant-info-error-icon" />
          <h3>Restaurant Not Found</h3>
          <p>We couldn&apos;t find the restaurant you&apos;re looking for.</p>
          <Link to="/" className="restaurant-info-back-link">Return to homepage</Link>
        </div>
      </div>
    );
  }

  if (hideRestaurant) {
    return (
      <div className="restaurant-info-hidden">
        <div className="restaurant-info-hidden-content">
          <VisibilityOffIcon className="restaurant-info-hidden-icon" />
          <h3>Restaurant Hidden</h3>
          <p>You&apos;ve temporarily hidden this restaurant. If you&apos;d like to view it again, simply click the button below.</p>
          <button
            className="restaurant-info-unhide-btn"
            onClick={handleUnhideRestaurant}
          >
            <VisibilityIcon /> Unhide this restaurant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='restaurant-info-main'>
      <div className='restaurant-info-actions'>
        <FavoriteIcon
          className={`restaurant-info-fav-icon ${isWished ? "restaurant-info-favourited" : "restaurant-info-notfavorited"}`}
          onClick={toggleWishlist}
        />
      </div>

      <div className='restaurant-info-content'>
        <div className='restaurant-info-header'>
          <h1 className='restaurant-info-name'>{Restaurant.name}</h1>

          <div className='restaurant-info-meta'>
            <span className='restaurant-info-cuisine'>
              {Array.isArray(Restaurant.cuisine)
                ? Restaurant.cuisine.join(', ')
                : Restaurant.cuisine?.split(' ').join(', ')}
            </span>

            <span className='restaurant-info-price'>{Restaurant.price}</span>
            <span className='restaurant-info-rating'>{Restaurant.rating} ★</span>
          </div>

          <p className='restaurant-info-address'>
            <PlaceIcon /> {Restaurant.address || 'Address not available'}
          </p>
        </div>

        <div className='restaurant-info-buttons'>
          <button
            className='restaurant-info-call-btn'
            onClick={() => window.location.href = `tel:${Restaurant.contact || ''}`}
          >
            <CallIcon />
            <span>Call</span>
          </button>

          <button
            className='restaurant-info-directions-btn'
            onClick={() => window.open(
              `https://www.google.com/maps/search/${encodeURIComponent(Restaurant.address || '')}`,
              '_blank'
            )}
          >
            <DirectionsIcon />
            <span>Directions</span>
          </button>

          <button className='restaurant-info-dining-btn'>
            <DiningIcon />
            <span>Dining</span>
          </button>
        </div>

        <div className='restaurant-info-status'>
          <div className={`restaurant-info-status-card ${serviceAvailability.delivery && isOpenNow && !isRaining ? 'restaurant-info-active' : ''}`}>
            <div>
              <h4>Delivery</h4>
              {serviceAvailability.delivery ? (
                !isOpenNow ? (
                  <div className='restaurant-info-unavailable'>
                    <img src="/Icons/close.png" alt="closed" className='restaurant-info-status-icon' />
                    <p>Currently not available (Closed).We will be back soon!!</p>
                  </div>
                ) : isRaining ? (
                  <div className='restaurant-info-unavailable'>
                    <img src="/Icons/raining.png" alt="heavy-rain" className='restaurant-info-status-icon' />
                    <p>Sorry, delivery is temporarily paused due to rain.</p>
                  </div>
                ) : (
                  <div className='restaurant-info-available'>
                    <img src="/Icons/deliveryboy.png" alt="delivery available" className='restaurant-info-status-icon' />
                    <span>Available now</span>
                  </div>
                )
              ) : (
                <div className='restaurant-info-unavailable'>
                  <img src="/Icons/no order.webp" alt="no orders" className='restaurant-info-status-icon' />
                  <p>Currently not taking delivery orders.</p>
                </div>
              )}
            </div>
          </div>

          <div className={`restaurant-info-status-card ${serviceAvailability.dining && isOpenNow ? 'restaurant-info-active' : ''}`}>
            <div>
              <h4>Dining</h4>
              {serviceAvailability.dining ? (
                !isOpenNow ? (
                  <div className='restaurant-info-unavailable'>
                    <img src="/Icons/close.png" alt="closed" className='restaurant-info-status-icon' />
                    <p>Currently not available (Closed)</p>
                  </div>
                ) : isRaining ? (
                  <div className='restaurant-info-unavailable'>
                    <img src="/Icons/close.png" alt="restaurant is closed" className='restaurant-info-status-icon' />
                    <p>Dining is closed due to rain. Please check back later.</p>
                  </div>
                ) : (
                  <div className='restaurant-info-available'>
                    <img src="/Icons/open.png" alt="restaurant is open" className='restaurant-info-status-icon' />
                    <span>Open now</span>
                  </div>
                )
              ) : (
                <div className='restaurant-info-unavailable'>
                  <img src="/Icons/no_dining.png" alt="dining not available" className='restaurant-info-status-icon' />
                  <p>Dining not available</p>
                </div>
              )}
            </div>
          </div>
          {serviceAvailability.dining && isOpenNow && (
            <div className='restaurant-info-active restaurant-info-status-card'>
              <div className="restaurant-info-booking">
                <h4>Want to dine in?</h4>
                <Link to={`/tablebooking/${Restaurant._id}`} className="restaurant-info-booking-btn">
                  Book a Table
                </Link>
              </div>
            </div>
          )}

          <div className={`restaurant-info-status-card ${petAllowed ? 'restaurant-info-active' : ''}`}>
            <div>
              <h4>Pet-Friendly</h4>
              {petAllowed ? (
                <div className='restaurant-info-available'>
                  <img src="/Icons/pet.png" alt="Pets are allowed" className='restaurant-info-pet-icon' />
                  <span>Pets are Welcome here!</span>
                </div>
              ) : (
                <div className='restaurant-info-unavailable'>
                  <img src="/Icons/no pets.png" alt="No pets allowed" className='restaurant-info-pet-icon' />
                  <p>Sorry, pets are not allowed</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='restaurant-info-divider' />

        <section className="restaurant-info-open-hours">
          <h3 className="hours-title">
            <CalendarTodayIcon className="hours-icon" /> Opening Hours
          </h3>

          {Restaurant.openHours && typeof Restaurant.openHours === 'object' && Object.keys(Restaurant.openHours).length > 0 ? (
            <div className="hours-container">
              <table className="hours-table">
                <tbody>
                  {Object.entries(Restaurant.openHours).map(([day, hours]) => (
                    <tr key={day} className="hours-row">
                      <td className="hours-day">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </td>
                      <td className="hours-time">
                        {typeof hours === 'string' ? (
                          <span>{hours}</span>
                        ) : (
                          <div className="hours-range">
                            {hours?.open && <span className="open-time">{hours.open}</span>}
                            {hours?.open && hours?.close && <span className="hours-separator"> – </span>}
                            {hours?.close && <span className="close-time">{hours.close}</span>}
                            {!hours?.open && !hours?.close && 'Closed'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="hours-unavailable">No opening hours available</p>
          )}
        </section>

        <div className='restaurant-info-divider' />
        <section className="restaurant-info-photos">
          <h3><CollectionsIcon /> Photos</h3>
          <div className="restaurant-info-photos-container">
            {Restaurant.photos?.length > 0 ? (
              <div className="restaurant-info-photos-scroll">
                {Restaurant.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Restaurant ${index + 1}`}
                    className="restaurant-info-photo"
                  />
                ))}
              </div>
            ) : (
              <div className="restaurant-info-no-photos">
                <img src="/Icons/no-photos.png" alt="No photos" />
                <p>No photos available for this restaurant</p>
              </div>
            )}
          </div>
        </section>

        <div className='restaurant-info-divider' />
        <p className='restaurant-info-year'>
          <CalendarTodayIcon /> Live on Bite Bliss since {establishmentYear}
        </p>
      </div>

      <section className="restaurant-info-feedback">
        <h5>Had a Bad Experience Here?</h5>
        <button
          className="restaurant-info-hide-btn"
          onClick={handleHideRestaurant}
        >
          <VisibilityOffIcon /> Hide this restaurant
        </button>
      </section>

      <section className='restaurant-info-legal'>
        <h4><GavelIcon /> Legal Information</h4>
        <div className='restaurant-info-legal-item'>
          <span><VerifiedIcon /> Legal Name</span>
          <p>{Restaurant.legalName || 'Not provided'}</p>
        </div>
        <div className='restaurant-info-legal-item'>
          <span><ReceiptIcon /> GST Number</span>
          <p>{Restaurant.gstNumber || 'Not provided'}</p>
        </div>
        <div className='restaurant-info-legal-item'>
          <span><PaymentIcon /> FSSAI License Number</span>
          <p>{Restaurant.fssaiNumber || '265566'}</p>
        </div>
      </section>

      <p className='restaurant-info-terms'>
        Please review the <Link to="/terms">terms of service</Link> for Bite Bliss
      </p>

      <div className='restaurant-info-back'>
        <Link to={`/restaurantdetails/${id}`} className='restaurant-info-menu-link'>
          <img src="/Icons/back.png" alt="back-icon" className='restaurant-info-back-icon' /> Go Back to Menu
        </Link>
      </div>
    </div>
  );
};

export default RestaurantInfo;