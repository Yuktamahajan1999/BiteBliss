/* eslint-disable no-unused-vars */
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CorporateCatering() {
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState("");
    const [activeCard, setActiveCard] = useState(null);
    const [selectedChef, setSelectedChef] = useState("");
    const [submittedForms, setSubmittedForms] = useState([]);
    const [userBookings, setUserBookings] = useState([]);
    const [topChefs, setTopChefs] = useState([]);
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});

    useEffect(() => {
        const fetchUserAddresses = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get('http://localhost:8000/address/getAddress', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUserAddresses(response.data);
                if (response.data.length > 0) {
                    setSelectedAddress(response.data[0].address);
                }
            } catch (error) {
                console.error('Failed to fetch addresses', error);
                toast.error('Failed to load your addresses');
            }
        };

        fetchUserAddresses();
    }, []);
    useEffect(() => {
        localStorage.setItem("submittedForms", JSON.stringify(submittedForms));
    }, [submittedForms]);
    const menuOptions = {
        Starters: [
            "Momos",
            "Pani Puri",
            "Kachori",
            "Vada Pav",
            "Pav Bhaji",
            "Samosa",
            "Spring Rolls",
            "Aloo Tikki Burger",
            "Paneer Wrap",
            "Schezwan Fries",
            "Chilli Paneer",
        ],
        "Main Course": [
            "Butter Naan",
            "Garlic Naan",
            "Aloo Paratha",
            "Paneer Tikka Masala",
            "Dal Makhani",
            "Biryani",
            "Rajma Chawal",
            "Chole Bhature",
            "Masala Dosa",
            "Idli-Sambar",
            "Coconut Rice",
            "Rasam",
            "Medu Vada",
            "Uttapam",
            "Siddu",
            "Chana Madra",
            "Babru",
            "Dham",
            "Hakka Noodles",
            "Manchurian",
            "Chilli Garlic Noodles",
            "Margherita Pizza",
            "Farmhouse Pizza",
            "Pepperoni Pizza",
            "Paneer Butter Masala",
            "Chicken Biryani",
            "Palak Paneer",
            "Veg Hakka Noodles",
            "Tandoori Chicken",
            "Kadhai Paneer",
            "Malai Kofta",
            "Hyderabadi Biryani",
            "Butter Chicken"
        ],
        Desserts: [
            "Gulab Jamun",
            "Rasmalai",
            "Kheer",
            "Jalebi",
            "Brownie",
            "Fruit Custard",
            "Moong dal Halwa"
        ]
    };
    const [selectedMenuItems, setSelectedMenuItems] = useState([]);
    const statusLabelMap = {
        pending: "Pending",
        accepted: "Accepted",
        arrived: "Chef Arrived",
        completed: "Completed",
        cancelled: "Cancelled"
    };

    const statusColorMap = {
        pending: "#555",
        accepted: "green",
        arrived: "orange",
        completed: "blue",
        cancelled: "red"
    };


    useEffect(() => {
        const fetchAvailableChefs = async () => {
            if (!selectedAddress) return;

            try {
                console.log('Fetching chefs for address:', selectedAddress);
                const response = await axios.get(
                    `http://localhost:8000/chef/availablechef?location=${encodeURIComponent(selectedAddress)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (response.data?.chefs) {
                    setTopChefs(response.data.chefs);
                } else {
                    setTopChefs([]);
                }
            } catch (error) {
                console.error("Error fetching chefs:", error);
                toast.error("Failed to load chef data");
                setTopChefs([]);
            }
        };

        fetchAvailableChefs();
    }, [selectedAddress]);

    const openForm = (type, chef = "") => {
        setFormType(type);
        setSelectedChef(chef);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setFormType("");
        setSelectedChef("");
        setSelectedMenuItems([]);
    };

    const toggleCard = (cardName) => {
        setActiveCard(activeCard === cardName ? null : cardName);
    };

    const postBookingData = async (data) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not authenticated");

            const currentAddress = userAddresses.find(a => a.address === selectedAddress);

            const response = await axios.post(
                "http://localhost:8000/chef/book",
                {
                    name: data.name?.trim() || "",
                    email: data.email?.trim() || "",
                    address: selectedAddress,
                    city: currentAddress?.city,
                    state: currentAddress?.state,
                    country: currentAddress?.country,
                    pincode: currentAddress?.pincode,
                    date: data.date || new Date().toISOString().split('T')[0],
                    eventTime: data.eventTime || "",
                    phone: data.phone?.trim() || "",
                    chefName: data.chefName || selectedChef || "N/A",
                    specialRequests: data.specialRequests?.trim() || "None",
                    menu: selectedMenuItems,
                    headCount: isNaN(parseInt(data.headCount, 10)) ? 1 : parseInt(data.headCount, 10),
                    eventType: data.eventType || "corporate"
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (err) {
            console.error("Booking error:", err.response?.data);
            throw err;
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const postData = {
                name: data.name,
                email: data.email,
                address: selectedAddress,
                date: data.date,
                eventTime: data.eventTime,
                phone: data.phone,
                chefName: selectedChef || data.chefName,
                specialRequests: data.specialRequests,
                menu: selectedMenuItems,
                headCount: parseInt(data.headCount, 10),
                eventType: data.eventType || "corporate"
            };

            const result = await postBookingData(postData);
            if (result) {
                setUserBookings(prev => [...prev, {
                    ...postData,
                    _id: result._id,
                    status: 'pending'
                }]);
                toast.success("Booking submitted successfully!");
                closeForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
        }
    };

    const handleLiveCookingSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const postData = {
                name: "Live Cooking Booking",
                email: "livecooking@example.com",
                phone: data.phone,
                address: "Office Venue",
                date: new Date().toISOString().split('T')[0],
                eventTime: data.eventTime || "",
                chefName: "Live Cooking Chef",
                specialRequests: data.specialRequests || "None",
                menu: selectedMenuItems,
                headCount: parseInt(data.headCount, 10) || 1,
                eventType: "corporate"
            };

            const result = await postBookingData(postData);
            if (result) {
                const newEntry = {
                    submissionType: "Live Cooking",
                    ...postData
                };
                setSubmittedForms([...submittedForms, newEntry]);
                toast.success("Live cooking booked successfully!", {
                    position: "top-center",
                    autoClose: 3000
                });
                toggleCard(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Live cooking booking failed", {
                position: "top-center",
                autoClose: 4000
            });
        }
    };

    const handleMenuChange = (e) => {
        const { value, checked } = e.target;
        setSelectedMenuItems((prev) =>
            checked ? [...prev, value] : prev.filter((item) => item !== value)
        );
    };

    const handleRateChef = (bookingId, rating) => {
        setRatings(prev => ({
            ...prev,
            [bookingId]: rating
        }));
    };

    const handleCommentChange = (bookingId, comment) => {
        setComments(prev => ({
            ...prev,
            [bookingId]: comment
        }));
    };

    const submitRating = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const rating = ratings[bookingId];
            const comment = comments[bookingId] || "Great service!";

            if (!rating) {
                toast.error('Please select a rating');
                return;
            }

            const booking = userBookings.find(b => b._id === bookingId);
            if (!booking) {
                toast.error('Booking not found');
                return;
            }

            if (!booking.chef && !booking.chefName) {
                toast.error('No chef associated with this booking');
                return;
            }

            const response = await axios.post(
                'http://localhost:8000/chef/ratingchef',
                {
                    id: bookingId,
                    rating,
                    comment,
                    reviewer: "User",
                    chefName: booking.chefName || (booking.chef?.chefName || "Unknown Chef")
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setUserBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking._id === bookingId
                        ? {
                            ...booking,
                            rated: true,
                            rating: rating,
                            comment: comment
                        }
                        : booking
                )
            );

            setRatings(prev => {
                const newRatings = { ...prev };
                delete newRatings[bookingId];
                return newRatings;
            });

            setComments(prev => {
                const newComments = { ...prev };
                delete newComments[bookingId];
                return newComments;
            });

            toast.success('Rating submitted successfully!');
        } catch (error) {
            console.error('Rating submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit rating');
        }
    };
    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const response = await axios.get(
                    "http://localhost:8000/chef/allbookings",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUserBookings(response.data.bookings || []);
            } catch (error) {
                toast.error("Failed to load your bookings");
            }
        };

        fetchUserBookings();

        const interval = setInterval(fetchUserBookings, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="cc-container">
            <header className="cc-header">
                <h1>Corporate Catering</h1>
                <p>Deliciously crafted meals for your office events and daily work-life!</p>
            </header>

            <section className="cc-services">
                <h2>Our Services</h2>
                <ul>
                    <li>Daily Office Lunch Programs</li>
                    <li>Corporate Events & Conferences</li>
                    <li>Custom Menu Planning</li>
                    <li>Bulk Meal Orders & Buffets</li>
                </ul>
            </section>

            <section className="cc-benefits">
                <h2>Why Choose Us?</h2>
                <div className="cc-benefit-grid">
                    {[
                        { title: "Fresh Ingredients", desc: "Locally sourced and always fresh." },
                        { title: "Flexible Packages", desc: "Custom options to fit your budget and team size." },
                        { title: "On-Time Delivery", desc: "Punctual service, every time." },
                        { title: "Expert Chefs", desc: "Skilled professionals cooking your favorites." }
                    ].map((item, i) => (
                        <div key={i} className="cc-benefit-card">
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="address-selector">
                <h3 className="address-selector__heading">Select Your Location</h3>
                {userAddresses.length > 0 ? (
                    <select
                        value={selectedAddress}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="address-selector__dropdown"
                    >
                        {userAddresses.map(address => (
                            <option
                                key={`addr-${address._id}`}
                                value={address.address}
                            >
                                {address.text}
                            </option>
                        ))}
                    </select>
                ) : (
                    <p className="address-selector__no-address">No addresses found. Please add an address in your profile.</p>
                )}
            </section>
            <section className="cc-chef-service">
                <h2>👨‍🍳 Chef On-Demand</h2>
                <p>Get a personal chef at your workplace or venue. They cook and clean too!</p>

                <div className="cc-chef-service-container">
                    <div className="cc-chef-card">
                        <h3>🍲 Live Cooking</h3>
                        <p>Chefs prepare meals fresh on-site with flair and flavor.</p>
                        <button onClick={() => toggleCard("liveCooking")} className="cc-toggle-btn">
                            🔥 View Form
                        </button>
                        {activeCard === "liveCooking" && (
                            <div className="cc-toggle-content active">
                                <form onSubmit={handleLiveCookingSubmit}>
                                    <p>
                                        Transform your corporate lunches and events into unforgettable culinary experiences!
                                        Our <strong>Live Cooking</strong> service brings professional chefs directly to your workplace or event venue — cooking fresh, delicious meals in real time. Ideal for:
                                    </p>
                                    <ul>
                                        <li>🎉 Office parties</li>
                                        <li>📊 Client meetings & corporate conferences</li>
                                        <li>🏢 Employee appreciation events</li>
                                    </ul>
                                    <p>
                                        Let your team enjoy the sizzle, aroma, and flavor — live, right where the action is!
                                    </p>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="cc-chef-card">
                        <h3>📋 Personalized Menus</h3>
                        <p>Choose custom dishes suited to your team&apos;s dietary needs.</p>
                        <button onClick={() => toggleCard("menu")}>🍽️Show Menu</button>
                        {activeCard === "menu" && (
                            <div className="cc-toggle-content active">
                                <div className="cc-menu-details">
                                    <h3>Select Menu Items:</h3>
                                    {Object.entries(menuOptions).map(([category, items]) => (
                                        <div key={category} className="menu-category" style={{ marginBottom: "1rem" }}>
                                            <div style={{ fontWeight: "bold", marginBottom: "0.5rem", color: "#e74c3c" }}>{category}</div>
                                            <div className="cc-menu-options">
                                                {items.map((item) => (
                                                    <label key={item} className="menu-label">
                                                        <input
                                                            type="checkbox"
                                                            value={item}
                                                            checked={selectedMenuItems.includes(item)}
                                                            onChange={handleMenuChange}
                                                        />
                                                        {item}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="cc-menu-selected">
                                        <strong>Selected:</strong> {selectedMenuItems.length === 0 ? "None" : selectedMenuItems.join(", ")}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="cc-chef-card">
                        <h3>🧽 Clean Service</h3>
                        <p>Our chefs handle the post-meal cleanup for a stress-free event.</p>
                        <button onClick={() => toggleCard("cleaning")}>🧼 View Hygiene Practices</button>
                        {activeCard === "cleaning" && (
                            <div className="cc-toggle-content active">
                                <ul>
                                    <li>✅ Use of eco-friendly sanitizers and disinfectants</li>
                                    <li>✅ Wearing gloves, aprons, and head masks at all times</li>
                                    <li>✅ Frequent hand washing and utensil sterilization</li>
                                    <li>✅ Thorough surface cleaning post meal service</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="cc-chef-card">
                        <h3>⭐ Top Rated Chefs</h3>
                        <p>Browse and book from our highly rated chefs!</p>
                        <button onClick={() => toggleCard("ratedChefs")}>👨‍🍳 View Chefs</button>
                        {activeCard === "ratedChefs" && (
                            <div className="cc-toggle-content active">
                                {!selectedAddress ? (
                                    <div className="no-address-message">
                                        <p>Please select an address to view available chefs</p>
                                    </div>
                                ) : topChefs.length > 0 ? (
                                    topChefs.map((chef) => (
                                        <div key={chef._id} className="cc-chef-profile">
                                            <h4>{chef.chefName}</h4>
                                            <p>Specialty: {chef.specialty}</p>
                                            <p>Status:
                                                <span className={`availability-badge ${chef.isAvailable ? 'available' : 'unavailable'}`}>
                                                    {chef.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            </p>
                                            <div className="availability-indicator">
                                                <span className={`indicator-dot ${chef.isAvailable ? 'available' : 'unavailable'}`}></span>
                                                {chef.isAvailable ? 'Ready to book' : 'Currently unavailable'}
                                            </div>
                                            <p>Status: {chef.isAvailable ? "Available" : "Unavailable"}</p>
                                            <p>Cuisines: {chef.cuisines && chef.cuisines.join(", ")}</p>
                                            <p>Menu: {chef.menu && chef.menu.join(", ")}</p>
                                            <p>Signature Dishes: {chef.signatureDishes && chef.signatureDishes.join(", ")}</p>
                                            <p>Rating: {chef.rating ? `${chef.rating.toFixed(1)} ★ (${chef.ratings?.length || 0} reviews)` : 'No ratings yet'}</p>
                                            <button
                                                className="cc-book-chef-btn"
                                                onClick={() => openForm("Book Chef", chef.chefName)}
                                                disabled={!chef.isAvailable}
                                                title={!chef.isAvailable ? "This chef is currently unavailable" : ""}
                                            >
                                                {chef.isAvailable ? `📅 Book ${chef.chefName}` : 'Unavailable'}
                                            </button>
                                            <hr />
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-chefs-message">
                                        <p>No chefs available in {selectedAddress}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section >

            {
                showForm && (
                    <div className="cc-modal-overlay" onClick={closeForm}>
                        <div className="cc-form-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="cc-close-btn" onClick={closeForm}>✖</button>
                            <h2>{formType}</h2>
                            <form onSubmit={handleModalSubmit}>
                                <input
                                    autoFocus
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    required
                                />
                                <div className="cc-form-group">
                                    <label htmlFor="phone">Phone Number:</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="e.g., 9876543210"
                                        pattern="[0-9]{10}"
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    value={selectedAddress}
                                    readOnly
                                    className="cc-form-input"
                                />
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <input
                                    type="time"
                                    name="eventTime"
                                    required
                                />
                                <div className="cc-form-group">
                                    <label htmlFor="headCount">Headcount:</label>
                                    <input
                                        type="number"
                                        id="headCount"
                                        name="headCount"
                                        min="1"
                                        max="20"
                                        placeholder="e.g., 10"
                                        required
                                    />
                                </div>
                                <div className="cc-menu-details">
                                    <h3>Select Menu Items:</h3>
                                    {Object.entries(menuOptions).map(([category, items]) => (
                                        <div key={category} className="menu-category">
                                            <h4>{category}</h4>
                                            <div className="cc-menu-options">
                                                {items.map((item) => (
                                                    <label key={item} className="menu-label">
                                                        <input
                                                            type="checkbox"
                                                            value={item}
                                                            checked={selectedMenuItems.includes(item)}
                                                            onChange={handleMenuChange}
                                                        />
                                                        {item}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="cc-menu-selected">
                                        <strong>Selected:</strong> {selectedMenuItems.length === 0 ? "None" : selectedMenuItems.join(", ")}
                                    </div>
                                </div>

                                <textarea
                                    name="specialRequests"
                                    placeholder="Special Requests (Optional)"
                                    rows={4}
                                />
                                <div className="cc-form-group">
                                    <label>Book Chef Name:</label>
                                    <div className="cc-chef-display">
                                        {selectedChef ? (
                                            <strong>{selectedChef}</strong>
                                        ) : (
                                            <span className="cc-no-chef">Please select a chef from Top Rated Chefs</span>
                                        )}
                                    </div>
                                    <input
                                        type="hidden"
                                        name="chefName"
                                        value={selectedChef}
                                        required
                                    />
                                </div>
                                <div className="cc-form-group">
                                    <label htmlFor="eventType">Event Type:</label>
                                    <select id="eventType" name="eventType" required>
                                        <option value="corporate">Corporate</option>
                                        <option value="birthday">Birthday</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                                <button type="submit" className="cc-submit-btn">
                                    Submit Request
                                </button>
                            </form>
                        </div>
                    </div >
                )
            }

            <section className="cc-status-section">
                <h2>📋 Booking Status</h2>
                {userBookings.length === 0 ? (
                    <p>No requests submitted yet.</p>
                ) : (
                    <div className="cc-status-list">
                        {userBookings.map((booking) => (
                            <div key={booking._id} className="cc-status-card">
                                <h4>Booking #{booking._id?.toString().slice(-6).toUpperCase()}</h4>
                                <div className="booking-details-grid">
                                    <div className="detail-row">
                                        <span className="detail-label">Customer:</span>
                                        <span className="detail-value">{booking.name || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Email:</span>
                                        <span className="detail-value">{booking.email || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Phone:</span>
                                        <span className="detail-value">{booking.phone || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Address:</span>
                                        <span className="detail-value">{booking.address || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Date:</span>
                                        <span className="detail-value">
                                            {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Time:</span>
                                        <span className="detail-value">
                                            {booking.eventTime ?
                                                (booking.eventTime.includes(':') ?
                                                    booking.eventTime :
                                                    `${booking.eventTime}:00`)
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Guests:</span>
                                        <span className="detail-value">
                                            {booking.headCount || booking.guestCount || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Book Chef Name:</span>
                                        <span className="detail-value">
                                            {booking.chef?.chefName ? (
                                                booking.chef.chefName
                                            ) : booking.chefName ? (
                                                booking.chefName
                                            ) : (
                                                'Awaiting assignment'
                                            )}
                                        </span>
                                    </div>

                                    {booking.chef?.specialty && (
                                        <div className="detail-row">
                                            <span className="detail-label">Chef Specialty:</span>
                                            <span className="detail-value">{booking.chef.specialty}</span>
                                        </div>
                                    )}
                                </div>

                                {booking.menu && booking.menu.length > 0 && (
                                    <div className="menu-section">
                                        <h5>Selected Menu:</h5>
                                        <ul className="menu-items">
                                            {booking.menu.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {booking.specialRequests && (
                                    <div className="requests-section">
                                        <h5>Special Requests:</h5>
                                        <p>{booking.specialRequests}</p>
                                    </div>
                                )}

                                <div className="status-section">
                                    <span className="status-label">Status:</span>
                                    <span
                                        className={`status-badge ${booking.status}`}
                                        style={{
                                            backgroundColor:
                                                booking.status === 'pending' ? '#FFA500' :
                                                    booking.status === 'accepted' ? '#4CAF50' :
                                                        booking.status === 'arrived' ? '#2196F3' :
                                                            booking.status === 'completed' ? '#673AB7' :
                                                                booking.status === 'cancelled' ? '#F44336' : '#9E9E9E',
                                            color: 'white',
                                            padding: '3px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {booking.status?.toUpperCase() || 'PENDING'}
                                    </span>
                                </div>
                                {booking.status === 'completed' && (
                                    <div className="rating-section">
                                        {booking.rated ? (
                                            <div className="existing-rating">
                                                <h5>Your Rating</h5>
                                                <div className="star-rating-display">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span
                                                            key={`star-${star}`}
                                                            onClick={() => handleRateChef(booking._id, star)}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                {booking.comment && (
                                                    <div className="rating-comment-display">
                                                        <p>{booking.comment}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <h5>Rate Your Experience</h5>
                                                <div className="star-rating">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span
                                                            key={star}
                                                            className={`star ${(ratings[booking._id] || 0) >= star ? 'filled' : ''}`}
                                                            onClick={() => handleRateChef(booking._id, star)}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <textarea
                                                    className="rating-comment"
                                                    placeholder="Leave a comment (optional)"
                                                    value={comments[booking._id] || ''}
                                                    onChange={(e) => handleCommentChange(booking._id, e.target.value)}
                                                />
                                                <button
                                                    className="submit-rating-btn"
                                                    onClick={() => submitRating(booking._id)}
                                                >
                                                    Submit Rating
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div >
    );
}

export default CorporateCatering;