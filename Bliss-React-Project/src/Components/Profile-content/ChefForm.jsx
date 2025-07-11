/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function ChefForm() {
    const initialFormState = {
        chefName: '',
        specialty: '',
        cuisines: [],
        price: 199,
        vegNonVeg: '',
        signatureDishes: '',
        menu: '',
        location: '',
        bio: '',
        contactNumber: '',
        isAvailable: true,
        isHygienic: false,
        isApproved: false
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [chefId, setChefId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [isApproved, setIsApproved] = useState(null);
    const [chefStatus, setChefStatus] = useState(null);
    const [profileData, setProfileData] = useState(null);

    const cuisineOptions = [
        'Butter Chicken', 'Masala Dosa', 'Chilli Garlic Noodles',
        'Margherita Pizza', 'Farmhouse Pizza', 'Pepperoni Pizza',
        'Siddu', 'Paneer Butter Masala', 'Chicken Biryani',
        'Palak Paneer', 'Chole Bhature', 'Veg Hakka Noodles',
        'Rajma Chawal', 'Idli Sambhar', 'Tandoori Chicken',
        'Dal Makhani', 'Aloo Paratha', 'Momos',
        'Spring Rolls', 'Pav Bhaji', 'Kadhai Paneer',
        'Malai Kofta', 'Hyderabadi Biryani', 'Garlic Naan'
    ];

    const vegOptions = [
        { value: 'veg', label: 'Vegetarian' },
        { value: 'non-veg', label: 'Non-Vegetarian' },
        { value: 'both', label: 'Both' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => {
            if (type === 'checkbox' && name === 'cuisines') {
                const currentCuisines = Array.isArray(prev.cuisines) ? prev.cuisines : [];
                return {
                    ...prev,
                    cuisines: checked
                        ? [...currentCuisines, value]
                        : currentCuisines.filter(c => c !== value)
                };
            }

            if (type === 'checkbox') {
                return { ...prev, [name]: checked };
            }

            return { ...prev, [name]: value };
        });
    };

    const validateForm = () => {
        if (!formData.chefName.trim()) {
            toast.error('Chef name is required');
            return false;
        }
        if (!formData.specialty.trim()) {
            toast.error('Specialty is required');
            return false;
        }
        if (formData.cuisines.length === 0) {
            toast.error('Please select at least one cuisine');
            return false;
        }
        if (!formData.vegNonVeg) {
            toast.error('Please select Veg/Non-Veg option');
            return false;
        }
        if (formData.price < 99 || formData.price > 1999) {
            toast.error('Price must be between ₹99 and ₹1999');
            return false;
        }
        if (!formData.signatureDishes.trim()) {
            toast.error('Signature dishes are required');
            return false;
        }
        if (!formData.location.trim()) {
            toast.error('Service location is required');
            return false;
        }
        if (!formData.contactNumber.trim()) {
            toast.error('Contact number is required');
            return false;
        }
        if (!formData.isHygienic) {
            toast.error('Please confirm hygiene commitment');
            return false;
        }
        return true;
    };

    const getChefProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setIsApproved(false);
                setChefStatus('no-token');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:8000/chefform/getmychefProfile', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000
            });

            if (response.data) {
                const profile = response.data;
                setChefId(profile._id);
                setFormData({
                    ...initialFormState,
                    ...profile,
                    cuisines: Array.isArray(profile.cuisines) ? profile.cuisines : [],
                    signatureDishes: Array.isArray(profile.signatureDishes)
                        ? profile.signatureDishes.join(', ')
                        : profile.signatureDishes || '',
                    menu: Array.isArray(profile.menu) ? profile.menu.join(', ') : profile.menu || '',
                });
                setIsEditing(true);
                setIsApproved(profile.isApproved ?? false);
                setChefStatus(profile.status || 'pending');
            }
        } catch (error) {
            console.error('Error in getChefProfile:', error);
            setIsApproved(false);
            setChefStatus('error');

            if (error.response?.status === 404) {
                setIsApproved(false);
                setChefStatus('not-found');
                setIsEditing(false);
                setChefId(null);
                setFormData(initialFormState);
            } else {
                toast.error(error.response?.data?.message || 'Failed to load profile');
            }
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getChefProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        const payload = {
            ...formData,
            price: Number(formData.price),
            signatureDishes: typeof formData.signatureDishes === 'string'
                ? formData.signatureDishes.split(',').map(d => d.trim()).filter(d => d)
                : Array.isArray(formData.signatureDishes)
                    ? formData.signatureDishes
                    : [],
            menu: typeof formData.menu === 'string'
                ? formData.menu.split(',').map(d => d.trim()).filter(d => d)
                : Array.isArray(formData.menu)
                    ? formData.menu
                    : []
        };

        try {
            const token = localStorage.getItem('token');
            const url = chefId
                ? `http://localhost:8000/chefform/updateChefprofile?id=${chefId}`
                : 'http://localhost:8000/chefform';
            const method = chefId ? 'put' : 'post';

            const res = await axios[method](url, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log("Submitting payload:", payload);

            toast.success(`Profile ${chefId ? 'updated' : 'created'} successfully`);
            if (!chefId && res.data._id) {
                setChefId(res.data._id);
                setIsEditing(true);
            }
            getChefProfile();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleDelete = async () => {
        if (!chefId) return toast.info('No profile to delete');
        const confirm = window.confirm('Are you sure you want to delete your profile?');
        if (!confirm) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/chefform/deleteChefprofile?id=${chefId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Profile deleted');
            setFormData(initialFormState);
            setChefId(null);
            setIsEditing(false);
            setIsApproved(false);
        } catch (err) {
            toast.error('Failed to delete profile');
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setChefId(null);
        setIsEditing(false);
    };

       useEffect(() => {
        if (chefId) {
            getChefBookings(); 

            const interval = setInterval(() => {
                getChefBookings();
            }, 30000); 

            return () => clearInterval(interval);
        }
    }, [chefId]);
    const getChefBookings = async () => {
        setLoadingBookings(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:8000/chefbook/getBookingbyChef',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data && Array.isArray(response.data)) {
                setBookings(response.data);
            } else {
                console.warn("Unexpected response format:", response.data);
                setBookings([]);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error(error.response?.data?.message || 'Failed to load bookings');
            setBookings([]);
        } finally {
            setLoadingBookings(false);
        }
    };

    useEffect(() => {
        if (chefId) {
            getChefBookings();
        }
    }, [chefId]);

    const handleAcceptBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/chefbook/acceptbooking?id=${bookingId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Booking accepted');
            getChefBookings();
        } catch (error) {
            toast.error('Failed to accept booking');
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/chefbook/cancelbooking?id=${bookingId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Booking cancelled');
            getChefBookings(chefId);
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    const handleArrivedBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/chefbook/arrived?id=${bookingId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Marked as arrived');
            getChefBookings(chefId);
        } catch (error) {
            toast.error('Failed to mark as arrived');
        }
    };

    const handleCompleteBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/chefbook/completechefbooking?id=${bookingId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Booking marked as completed');
            getChefBookings(chefId);
        } catch (error) {
            toast.error('Failed to complete booking');
        }
    };


    if (loading || isApproved === null) {
        console.log("Rendering - Loading state:", { loading, isApproved });
        return <p>Loading profile...</p>;
    }

    console.log("Rendering - Main check:", {
        isApproved,
        chefStatus,
        loading,
        isEditing,
        formData: Object.keys(formData)
    });

    {
        !isApproved && (
            <p className="approval-note" style={{ color: '#cc0000', marginTop: '0.5rem' }}>
                ⚠️ Your profile is pending admin approval. You can fill the form, but cannot submit until approved.
            </p>
        )
    }



    return (
        <div>
            <form onSubmit={handleSubmit} className="chef-form">
                <h2>{isEditing ? 'Update Chef Profile' : 'Create Chef Profile'}</h2>

                <div className="chef-form__group">
                    <label htmlFor="chefName" className="chef-form__label">Chef Name *</label>
                    <input
                        id="chefName"
                        type="text"
                        name="chefName"
                        value={formData.chefName}
                        onChange={handleChange}
                        className="chef-form__input"
                        required
                        placeholder="Your name"
                    />
                </div>

                <div className="chef-form__group">
                    <label htmlFor="specialty" className="chef-form__label">Specialty *</label>
                    <input
                        id="specialty"
                        type="text"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        className="chef-form__input"
                        required
                        placeholder="Your cooking specialty"
                    />
                </div>

                <div className="chef-form__group">
                    <label className="chef-form__label">Cuisines *</label>
                    <div className="chef-form__options">
                        {cuisineOptions.map(cuisine => (
                            <div key={cuisine} className="chef-form__option">
                                <input
                                    id={`cuisine-${cuisine}`}
                                    type="checkbox"
                                    name="cuisines"
                                    value={cuisine}
                                    checked={Array.isArray(formData.cuisines) && formData.cuisines.some(c => c.trim() === cuisine.trim())}
                                    onChange={handleChange}
                                    className="chef-form__checkbox"
                                />
                                <label htmlFor={`cuisine-${cuisine}`} className="chef-form__option-label">
                                    {cuisine}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chef-form__group">
                    <label htmlFor="vegNonVeg" className="chef-form__label">Food Type *</label>
                    <select
                        id="vegNonVeg"
                        name="vegNonVeg"
                        value={formData.vegNonVeg}
                        onChange={handleChange}
                        className="chef-form__select"
                        required
                    >
                        <option value="">Select</option>
                        {vegOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="chef-form__group">
                    <label htmlFor="price" className="chef-form__label">Price per Event (₹) *</label>
                    <input
                        id="price"
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="chef-form__input"
                        min="199"
                        max="1999"
                        required
                    />
                </div>

                <div className="chef-form__group">
                    <label htmlFor="signatureDishes" className="chef-form__label">Signature Dishes *</label>
                    <textarea
                        id="signatureDishes"
                        name="signatureDishes"
                        value={formData.signatureDishes}
                        onChange={handleChange}
                        className="chef-form__textarea"
                        required
                        placeholder="List your signature dishes"
                        rows="3"
                    />
                    <small className="chef-form__hint">Separate with commas</small>
                </div>

                <div className="chef-form__group">
                    <label htmlFor="menu" className="chef-form__label"> Menu</label>
                    <textarea
                        id="menu"
                        name="menu"
                        value={formData.menu}
                        onChange={handleChange}
                        className="chef-form__textarea"
                        placeholder="List items from your menu"
                        rows="3"
                    />
                    <small className="chef-form__hint">Separate with commas</small>
                </div>

                <div className="chef-form__group">
                    <label htmlFor="location" className="chef-form__label">Service Location *</label>
                    <input
                        id="location"
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="chef-form__input"
                        required
                        placeholder="Areas you serve"
                    />
                </div>

                <div className="chef-form__group">
                    <label htmlFor="contactNumber" className="chef-form__label">Contact Number *</label>
                    <input
                        id="contactNumber"
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className="chef-form__input"
                        required
                        placeholder="Your phone number"
                    />
                </div>

                <div className="chef-form__group">
                    <label htmlFor="bio" className="chef-form__label">About You</label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="chef-form__textarea"
                        placeholder="Tell us about yourself"
                        rows="4"
                    />
                </div>

                <div className="chef-form__checkbox-group">
                    <label className="chef-form__checkbox-label">
                        <input
                            type="checkbox"
                            name="isHygienic"
                            checked={formData.isHygienic}
                            onChange={handleChange}
                            className="chef-form__checkbox"
                            required
                        />
                        I maintain proper hygiene standards *
                    </label>
                </div>

                <div className="chef-form__checkbox-group">
                    <label className="chef-form__checkbox-label">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleChange}
                            className="chef-form__checkbox"
                        />
                        Currently available for bookings
                    </label>
                </div>

                <div className="chef-form__actions">
                    <button
                        type="submit"
                        className={`chef-form__submit ${isEditing ? 'update' : 'create'}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
                    </button>

                    {isEditing && (
                        <>
                            <button
                                type="button"
                                className="chef-form__delete"
                                onClick={handleDelete}
                            >
                                Delete Profile
                            </button>
                            <button
                                type="button"
                                className="chef-form__reset"
                                onClick={resetForm}
                            >
                                Reset Form
                            </button>
                        </>
                    )}
                </div>
            </form >
            {isEditing && (
                <div className="bookings-container">
                    <h3 className="bookings-title">Your Bookings</h3>
                    {loadingBookings ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading bookings...</p>
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="bookings-grid">
                            {bookings.map((booking) => (
                                <div key={booking._id} className="booking-card">
                                    <div className="booking-header">
                                        <h4 className="booking-id">Booking #{booking._id?.toString().slice(-6).toUpperCase()}</h4>
                                        <span className={`status-badge ${booking.status}`}>
                                            {booking.status?.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="booking-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Customer:</span>
                                            <span className="detail-value">{booking.customerName || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Event Date:</span>
                                            <span className="detail-value">
                                                {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Time:</span>
                                            <span className="detail-value">{booking.eventTime || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Contact:</span>
                                            <span className="detail-value">{booking.customerPhone || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Location:</span>
                                            <span className="detail-value">{booking.location || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Guests:</span>
                                            <span className="detail-value">{booking.headCount || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Type:</span>
                                            <span className="detail-value">{booking.eventType || 'N/A'}</span>
                                        </div>
                                        <div className="requests-section">
                                            <span className="detail-label">Special Requests:</span>
                                            <p className="requests-text">{booking.notes || "None"}</p>
                                        </div>
                                        <div className="menu-section">
                                            <span className="detail-label">Menu Selected:</span>

                                            <ul className="menu-items">
                                                {booking.menu && Array.isArray(booking.menu) && booking.menu.length > 0 ? (
                                                    booking.menu.map((item, index) => (
                                                        <li key={index} className="menu-item">
                                                            <span className="menu-icon">🍽️</span>
                                                            {item}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="menu-item">No menu items selected</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="booking-actions">
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    className="btn accept-btn"
                                                    onClick={() => handleAcceptBooking(booking._id)}
                                                >
                                                    ✓ Accept Booking
                                                </button>
                                                <button
                                                    className="btn cancel-btn"
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                >
                                                    ✕ Decline
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'accepted' && (
                                            <button
                                                className="btn arrived-btn"
                                                onClick={() => handleArrivedBooking(booking._id)}
                                            >
                                                🚗 Mark Arrived
                                            </button>
                                        )}
                                        {booking.status === 'arrived' && (
                                            <button
                                                className="btn complete-btn"
                                                onClick={() => handleCompleteBooking(booking._id)}
                                            >
                                                ✓ Mark Completed
                                            </button>
                                        )}
                                        {(booking.status === 'accepted' || booking.status === 'arrived') && (
                                            <button
                                                className="btn cancel-btn"
                                                onClick={() => handleCancelBooking(booking._id)}
                                            >
                                                ✕ Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-bookings">
                            <p>No bookings yet. Check back later!</p>
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
}

export default ChefForm;