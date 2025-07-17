/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FeedingIndia = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState("");
    const [showVolunteerForm, setVolunteerForm] = useState(false);
    const [testimonials, setTestimonials] = useState([]);
    const [donorName, setDonorName] = useState("");
    const [donorEmail, setDonorEmail] = useState("");
    const [donorMessage, setDonorMessage] = useState("");
    const amountToSend = Number(selectedAmount);
    const nameToSend = donorName;
    const emailToSend = donorEmail;

    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/testimonial/getAlltestimonial?page=feeding-india`)
            .then(res => {
                if (res.data.success) {
                    setTestimonials(res.data.data);
                }
            })
            .catch(err => {
                console.error("Failed to fetch testimonials", err);
            });
    }, []);


    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDonationSubmit = async () => {
        if (!selectedAmount) return toast.error("Please select an amount!");
        if (!donorName || !donorEmail) return toast.error("Please fill all fields!");

        try {
            setIsSubmitting(true);
            const paymentRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payment`, {
                method: "google-pay",
                type: 'donation',
                amount: amountToSend,
                name: nameToSend,
                email: emailToSend,
                message: donorMessage
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (paymentRes.data.success && paymentRes.data.paymentId) {
                navigate('/paymentpage', {
                    state: {
                        amount: amountToSend,
                        name: nameToSend,
                        email: emailToSend,
                        paymentId: paymentRes.data.paymentId,
                        type: 'donation',
                        isDonation: true
                    }
                });
            } else {
                throw new Error("Invalid payment response");
            }
        } catch (err) {
            console.error("Donation error", err);
            toast.error(err.response?.data?.message || "Payment processing failed");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleVolunteerSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.elements[0].value.trim();
        const email = form.elements[1].value.trim();
        const phone = form.elements[2].value.trim();
        const address = form.elements[3].value.trim();
        const interest = form.elements[4].value.trim();

        console.log("Volunteer form data:", { name, email, phone, address, interest });

        if (!name || !email || !phone || !address || !interest) {
            toast.error("All fields are required.");
            return;
        }

        axios.post(`${import.meta.env.VITE_API_BASE_URL}/volunteer`, {
            name, email, phone, address, interests: interest
        })
            .then(res => {
                console.log("Volunteer response:", res.data);
                if (res.data.success) {
                    toast.success("Thank you for volunteering! 🤝");
                    setVolunteerForm(false);
                    form.reset();
                } else {
                    toast.error("Failed to submit volunteer data.");
                }
            })
            .catch(err => {
                console.error("Volunteer submission failed", err);
                toast.error("Error submitting volunteer data.");
            });
    };

    return (
        <div className="feeding-india-container">
            <header className="feeding-header">
                <h1 className="feeding-heading">🥗 Feeding India</h1>
                <p className="feeding-tagline">Together, let&apos;s end hunger one plate at a time</p>
                <div className="header-gradient"></div>
            </header>

            <section className="feeding-india-banner">
                <img src="Images/Feeding-India.jpg" alt="Feeding India Banner" />
                <div className="feeding-india-text">
                    <p>You&apos;re yet to start your journey of Feeding India.</p>
                    <p>Start by contributing</p>
                </div>
            </section>

            <div className="section-card mission-card">
                <div className="section-icon">🎯</div>
                <h2 className="section-title">Our Mission</h2>
                <p className="section-text">
                    We aim to eliminate hunger by bridging the gap between excess food and people in need.
                    Join us to support food donation drives, raise awareness, and make a real difference.
                </p>
                <div className="mission-stats">
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Meals Shared</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">Launching</div>
                        <div className="stat-label">Volunteer Network</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">0</div>
                        <div className="stat-label">Cities Reached</div>
                    </div>
                </div>
            </div>

            <div className="section-card impact-card">
                <h2 className="section-title">Our Vision & Impact</h2>
                <div className="impact-grid">
                    <div className="impact-item"><div className="impact-icon">🍛</div><h3>Future Meals</h3><p>We aim to serve nutritious meals to communities in need by rescuing excess food.</p></div>
                    <div className="impact-item"><div className="impact-icon">👥</div><h3>Building Our Network</h3><p>We&apos;re inviting volunteers across India to join our mission and start making a difference.</p></div>
                    <div className="impact-item"><div className="impact-icon">🏙️</div><h3>Nationwide Goals</h3><p>Our goal is to expand to 50+ cities with local partnerships and sustainable systems.</p></div>
                    <div className="impact-item"><div className="impact-icon">♻️</div><h3>Food Waste Mission</h3><p>We&apos;re committed to preventing food waste — one meal at a time.</p></div>
                </div>
            </div>

            <div className="section-card cta-card">
                <h2 className="section-title">Join Our Movement</h2>
                <p className="section-text">
                    Whether you can donate time, money, or resources, every contribution helps feed someone in need.
                </p>
                <div className="cta-buttons">
                    <div className="cta-buttons">
                        <button className="cta-btn donate-btn" onClick={() => { setShowForm(true); setVolunteerForm(false); }}>
                            <span className="btn-icon">💰</span> <span>Donate Now</span>
                        </button>
                        <button className="cta-btn volunteer-btn" onClick={() => { setVolunteerForm(true); setShowForm(false); }}>
                            <span className="btn-icon">🙌</span> <span>Volunteer</span>
                        </button>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="section-card donate-form-card">
                    <div className="form-header">
                        <h2 className="section-title">Make a Donation</h2>
                        <button className="close-btn" onClick={() => setShowForm(false)}>✖</button>
                    </div>
                    <form className="donate-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="preset-buttons">
                            {[10, 20, 30, 100, 500].map((amt) => (
                                <button
                                    key={amt}
                                    type="button"
                                    className={`preset-btn ${selectedAmount == amt ? "active" : ""}`}
                                    onClick={() => setSelectedAmount(amt)}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            value={selectedAmount}
                            onChange={(e) => setSelectedAmount(e.target.value)}
                            placeholder="Or enter your own amount"
                            min="10"
                            max="500"
                            required
                            className="donate-input"
                        />
                        <input
                            type="text"
                            placeholder="Your Name"
                            required
                            className="donate-input"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Your Email"
                            required
                            className="donate-input"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                        />
                        <textarea
                            placeholder="Message (optional)"
                            className="donate-input"
                            value={donorMessage}
                            onChange={(e) => setDonorMessage(e.target.value)}
                            rows={3}
                        />
                        <button
                            type="button"
                            className="cta-btn donate-btn"
                            onClick={handleDonationSubmit}
                        >
                            <span className="btn-icon">💳</span> <span>Proceed to Payment</span>
                        </button>
                    </form>
                </div>
            )}

            {showVolunteerForm && (
                <div className="section-card volunteer-form-card">
                    <div className="form-header">
                        <h2 className="section-title">Join as a Volunteer</h2>
                        <button className="close-btn" onClick={() => setVolunteerForm(false)}>✖</button>
                    </div>
                    <form className="donate-form" onSubmit={handleVolunteerSubmit}>
                        <input type="text" placeholder="Your Name" required className="donate-input" />
                        <input type="email" placeholder="Your Email" required className="donate-input" />
                        <input type="tel" placeholder="Phone Number" required className="donate-input" />
                        <input type="text" placeholder="City" required className="donate-input" />
                        <textarea placeholder="Why do you want to volunteer?" rows="3" required className="donate-textarea" />
                        <button type="submit" className="cta-btn volunteer-btn">
                            <span className="btn-icon">🚀</span> <span>Submit</span>
                        </button>
                    </form>
                </div>
            )}

            <div className="testimonial-section">
                <h2 className="section-title">Stories of Hope</h2>
                {testimonials.length > 0 ? (
                    testimonials.map((test) => (
                        <div key={test._id} className="testimonial-card">
                            <div className="testimonial-content">&quot;{test.story}&quot;</div>
                            <div className="testimonial-author">- {test.author}, {test.location}</div>
                        </div>
                    ))
                ) : (
                    <div>No testimonials yet.</div>
                )}
            </div>
        </div>
    );
};

export default FeedingIndia;
