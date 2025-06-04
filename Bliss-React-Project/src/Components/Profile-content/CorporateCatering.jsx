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
            try {
                const response = await axios.get("http://localhost:8000/chef/availablechef");
                setTopChefs(response.data.chefs || []);
            } catch (error) {
                console.error("Error fetching chefs:", error);
                toast.error("Failed to load chef data");
            }
        };
        fetchAvailableChefs();
    }, []);

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
            if (!token) {
                throw new Error("User not authenticated. Please log in.");
            }
            const response = await axios.post(
                "http://localhost:8000/chef/book",
                {
                    name: data.name?.trim() || "",
                    email: data.email?.trim() || "",
                    address: data.address?.trim() || "",
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
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
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
                address: data.address,
                date: data.date,
                eventTime: data.eventTime,
                phone: data.phone,
                chefName: data.chefName || selectedChef || "N/A",
                specialRequests: data.specialRequests,
                menu: selectedMenuItems,
                headCount: parseInt(data.headCount, 10),
                eventType: data.eventType || "corporate"
            };

            const result = await postBookingData(postData);
            if (result) {
                const newEntry = {
                    submissionType: formType,
                    ...postData
                };
                setSubmittedForms([...submittedForms, newEntry]);
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

        const interval = setInterval(fetchUserBookings, 30000);

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
                                {topChefs.map((chef, index) => (
                                    <div key={index} className="cc-chef-profile">
                                        <h4>{chef.chefName}</h4>
                                        <p>Specialty: {chef.specialty}</p>
                                        <p>Status: {chef.isAvailable ? "Available" : "Unavailable"}</p>
                                        <p>Cuisines: {chef.cuisines && chef.cuisines.join(", ")}</p>
                                        <p>Menu: {chef.menu && chef.menu.join(", ")}</p>
                                        <p>Signature Dishes: {chef.signatureDishes && chef.signatureDishes.join(", ")}</p>
                                        <button
                                            className="cc-book-chef-btn"
                                            onClick={() => openForm("Book Chef", chef.chefName)}
                                            disabled={!chef.isAvailable}
                                        >
                                            📅 Book {chef.chefName}
                                        </button>
                                        <hr />
                                    </div>
                                ))}
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
                                    placeholder="Event Address"
                                    required
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
                                <input
                                    type="hidden"
                                    name="chefName"
                                    value={selectedChef}
                                />
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
                        {userBookings.map((entry, index) => (
                            <div key={entry._id || index} className="cc-status-card" data-type={entry.submissionType || "Booking"}>
                                <h4>{entry.submissionType || "Booking"}</h4>
                                {entry.name && <p><strong>Name:</strong> {entry.name}</p>}
                                {entry.email && <p><strong>Email:</strong> {entry.email}</p>}
                                {entry.phone && <p><strong>Phone:</strong> {entry.phone}</p>}
                                {entry.address && <p><strong>Address:</strong> {entry.address}</p>}
                                {entry.date && <p><strong>Date:</strong> {new Date(entry.date).toLocaleDateString()}</p>}
                                {entry.chefName && <p><strong>Chef:</strong> {entry.chefName}</p>}
                                {entry.specialRequests && <p><strong>Requests:</strong> {entry.specialRequests}</p>}
                                {entry.headCount && <p><strong>Headcount:</strong> {entry.headCount}</p>}
                                {entry.status && (
                                    <p>
                                        <strong>Status:</strong>{" "}
                                        <span style={{
                                            color: statusColorMap[entry.status] || "#555",
                                            fontWeight: "bold",
                                            textTransform: "capitalize"
                                        }}>
                                            {statusLabelMap[entry.status] || entry.status}
                                        </span>
                                    </p>
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