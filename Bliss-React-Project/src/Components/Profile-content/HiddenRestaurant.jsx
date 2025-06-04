// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEye } from 'react-icons/fi';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { toast } from 'react-toastify';

const HiddenRestaurants = () => {
    const [hiddenRestaurants, setHiddenRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user, unhideRestaurant } = useContext(UserContext);

    const fetchHiddenRestaurants = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8000/restauranthidden/gethidden", {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            setHiddenRestaurants(res.data.hiddenRestaurants || []);
        } catch (err) {
            console.error("Error fetching hidden restaurants:", err);
            toast.error('Failed to load hidden restaurants', {
                position: 'top-center',
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchHiddenRestaurants();
        } else {
            setHiddenRestaurants([]);
            setLoading(false);
        }
    }, [user?.token]);

    const handleUnhide = async (restaurantId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete("http://localhost:8000/restauranthidden/unhide", {
                data: { restaurantId },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (typeof unhideRestaurant === "function") {
                unhideRestaurant(restaurantId);
            }
            toast.success('Restaurant is now visible', {
                position: 'top-center',
                autoClose: 2000
            });
            fetchHiddenRestaurants();
        } catch (err) {
            console.error("Error unhiding restaurant:", err);
            toast.error('Failed to unhide restaurant', {
                position: 'top-center',
                autoClose: 3000
            });
        }
    };

    if (loading) {
        return (
            <div className="hidden-restaurants-loading">
                <div className="loading-spinner"></div>
                <p>Loading your hidden restaurants...</p>
            </div>
        );
    }

    return (
        <div className="hidden-restaurants-container">
            <div className="hidden-restaurants-header">
                <button className="hidden-back-button" onClick={() => navigate(-1)}>
                    <FiArrowLeft className="back-icon" />
                </button>
                <div className="header-content">
                    <h1>Hidden Restaurants</h1>
                    <p className="subtitle">
                        {hiddenRestaurants.length} restaurant{hiddenRestaurants.length !== 1 ? 's' : ''} hidden
                    </p>
                </div>
            </div>

            {hiddenRestaurants.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👀</div>
                    <h3>No hidden restaurants found</h3>
                    <p>Restaurants you hide will appear here</p>
                </div>
            ) : (
                <div className="restaurants-grid">
                    {hiddenRestaurants.map((restaurant) => (
                        <div className="restaurant-card" key={restaurant._id}>
                            <div className="card-image-container">
                                <img
                                    src={restaurant.image || "https://via.placeholder.com/300"}
                                    alt={restaurant.name}
                                    className="restaurant-image"
                                    onClick={() => navigate(`/restaurantdetails/${restaurant._id}`)}
                                />
                                <div className="hidden-badge">Hidden</div>
                            </div>
                            <div className="card-content">
                                <h2 onClick={() => navigate(`/restaurantdetails/${restaurant._id}`)}>
                                    {restaurant.name}
                                </h2>
                                <div className="restaurant-meta">
                                    <span className="rating">
                                        ⭐ {restaurant.rating || 'No rating'}
                                    </span>
                                    <span className="cuisine">
                                        {Array.isArray(restaurant.cuisine)
                                            ? restaurant.cuisine.join(', ')
                                            : restaurant.cuisine || "Cuisine not specified"}
                                    </span>
                                </div>
                                <div className="restaurant-details">
                                    <p className="address">
                                        📍 {restaurant.address || "Address not available"}
                                    </p>
                                    <p className="hours">
                                        🕒 {restaurant.openHours
                                            ? Object.entries(restaurant.openHours)
                                                .map(([day, hours]) => `${day}: ${hours.open || 'Closed'}`)
                                                .join(' | ')
                                            : "Hours not available"}
                                    </p>
                                </div>
                                <div className="action-buttons">
                                    <button
                                        className="unhide-button"
                                        onClick={() => handleUnhide(restaurant._id)}
                                    >
                                        <FiEye className="button-icon" />
                                        Unhide
                                    </button>
                                    <button
                                        className="view-button"
                                        onClick={() => navigate(`/restaurantdetails/${restaurant._id}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HiddenRestaurants;