/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const TableBooking = () => {
    const [activeTab, setActiveTab] = useState('form');
    const [experienceInput, setExperienceInput] = useState('');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [showChat, setShowChat] = useState(false);
    const { id: restaurantId } = useParams();
    const [userBookings, setUserBookings] = useState([]);
    const [bookingId, setBookingId] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        bookingDate: '',
        bookingTime: '',
        numberOfGuests: '',
        specialRequests: '',
    });

    const token = localStorage.getItem('token');
    const { user } = useContext(UserContext);

    useEffect(() => {
        return () => {
            if (selectedMedia?.url) {
                URL.revokeObjectURL(selectedMedia.url);
            }
        };
    }, [selectedMedia]);

    useEffect(() => {
        const storedId = localStorage.getItem('bookingId');
        if (storedId) {
            setBookingId(storedId);
        }
    }, []);

    useEffect(() => {
        const fetchExperiences = async () => {
            if (activeTab === 'experience' && bookingId) {
                try {
                    const res = await axios.get(`http://localhost:8000/bookings/getExperience?id=${bookingId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setExperiences(res.data.experiences || []);
                } catch (err) {
                    console.error('Error fetching experiences:', err);
                }
            }
        };
        fetchExperiences();
    }, [activeTab, bookingId, token]);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const mediaUrl = URL.createObjectURL(file);
            setSelectedMedia({
                url: mediaUrl,
                type: file.type,
                file
            });
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            const bookingData = {
                ...formData,
                numberOfGuests: parseInt(formData.numberOfGuests),
                restaurantId,
                experiences: [],
            };

            const res = await axios.post('http://localhost:8000/bookings', bookingData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newBookingId = res.data._id || res.data.booking?._id;
            setBookingId(newBookingId);
            localStorage.setItem('bookingId', newBookingId);

            const bookingsRes = await axios.get('http://localhost:8000/bookings/getBookingsByUser', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserBookings(bookingsRes.data.bookings || []);

            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                bookingDate: '',
                bookingTime: '',
                numberOfGuests: '',
                specialRequests: '',
            });

            toast.info('Your booking request has been submitted. You will be notified when the restaurant confirms.', {
                position: "top-center",
                autoClose: 5000
            });
        } catch (error) {
            console.error('Booking error:', error.response?.data || error.message);
            toast.error(error.response?.data?.error || 'Booking failed');
        }
    };

    const handleExperienceSubmit = async () => {
        if (!experienceInput.trim()) return;

        if (!bookingId) {
            toast.error('Please book a table before sharing an experience.');
            return;
        }

        try {
            const expFormData = new FormData();
            expFormData.append('text', experienceInput);
            if (selectedMedia?.file) {
                expFormData.append('media', selectedMedia.file);
            }

            const res = await axios.post(
                `http://localhost:8000/bookings/experience?id=${bookingId}`,
                expFormData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setExperiences(prev => [...prev, res.data.experience]);
            setExperienceInput('');
            setSelectedMedia(null);
            toast.success('Experience shared successfully!');
        } catch (error) {
            console.error('Experience error:', error.response?.data || error.message);
            toast.error(error.response?.data?.error || 'Failed to add experience');
        }
    };

    const handleChatSend = () => {
        if (!chatInput.trim()) return;
        setChatMessages([...chatMessages, { from: 'user', text: chatInput }]);
        setTimeout(() => {
            setChatMessages(prev => [...prev, { from: 'bot', text: "Thanks! We'll get back to you soon." }]);
        }, 1000);
        setChatInput('');
    };

    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                const res = await axios.get('http://localhost:8000/bookings/getBookingsByUser', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserBookings(res.data.bookings || []);
            } catch (error) {
                console.error('Error fetching user bookings:', error.response?.data || error.message);
                toast.error("Could not load your bookings");
                setUserBookings([]);
            }
        };

        if (activeTab === 'mybookings' || activeTab === 'experience') {
            fetchUserBookings();
        }
    }, [activeTab, token]);

    return (
        <div className="table-booking-container">
            <h1 className="page-title">Table Reservations</h1>

            <div className="tab-buttons">
                <button onClick={() => setActiveTab('form')} className={activeTab === 'form' ? 'active' : ''}>Book Table</button>
                <button onClick={() => setActiveTab('experience')} className={activeTab === 'experience' ? 'active' : ''}>Experiences</button>
                <button onClick={() => setActiveTab('help')} className={activeTab === 'help' ? 'active' : ''}>Help</button>
                <button onClick={() => setActiveTab('mybookings')} className={activeTab === 'mybookings' ? 'active' : ''}>My Bookings</button>
            </div>

            {activeTab === 'form' && (
                <div className="tab-content">
                    <h2 className="section-title">Book a Table</h2>
                    <form className="booking-form" onSubmit={handleBookingSubmit}>
                        <input type="text" name="fullName" placeholder="Full Name" required value={formData.fullName} onChange={handleFormChange} />
                        <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleFormChange} />
                        <input type="tel" name="phoneNumber" placeholder="Phone Number" required value={formData.phoneNumber} onChange={handleFormChange} />
                        <input type="date" name="bookingDate" required value={formData.bookingDate} onChange={handleFormChange} />
                        <input type="time" name="bookingTime" required value={formData.bookingTime} onChange={handleFormChange} />
                        <input type="number" name="numberOfGuests" placeholder="Number of Guests" required value={formData.numberOfGuests} onChange={handleFormChange} />
                        <textarea name="specialRequests" placeholder="Special Requests" value={formData.specialRequests} onChange={handleFormChange} />
                        <button type="submit" className="submit-btn">Reserve Table</button>
                    </form>
                </div>
            )}

            {activeTab === 'experience' && (
                <div className="tab-content">
                    {userBookings.length === 0 ? (
                        <p className="empty-msg">You need a booking before sharing your experience.</p>
                    ) : (
                        <>
                            <h2 className="section-title">Share Your Experience</h2>
                            <textarea
                                value={experienceInput}
                                onChange={(e) => setExperienceInput(e.target.value)}
                                placeholder="Write your experience here..."
                                className="experience-textarea"
                            />
                            <div className="file-upload-wrapper">
                                <label htmlFor="media-upload" className="custom-file-label">
                                    {selectedMedia
                                        ? selectedMedia.type.startsWith('video')
                                            ? 'Video Selected'
                                            : 'Image Selected'
                                        : 'Upload Image or Video'}
                                </label>
                                <input
                                    id="media-upload"
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden-file-input"
                                    onChange={handleMediaChange}
                                />
                                {selectedMedia && (
                                    <div className="media-preview-images">
                                        <button
                                            className="close-btn-image"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMedia(null);
                                            }}
                                            aria-label="Close"
                                        >
                                            &#10005;
                                        </button>
                                        {selectedMedia.type.startsWith('image') ? (
                                            <img src={selectedMedia.url} alt="Preview" />
                                        ) : (
                                            <video controls src={selectedMedia.url} />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="experience-actions">
                                <button
                                    onClick={handleExperienceSubmit}
                                    disabled={!experienceInput.trim()}
                                    className="submit-btn"
                                >
                                    Share Experience
                                </button>
                            </div>

                            <div className="experience-list">
                                {experiences.length === 0 ? (
                                    <p className="empty-msg">No experiences shared yet.</p>
                                ) : (
                                    experiences.map((exp, i) => (
                                        <div key={i} className="experience-card">
                                            <p>{exp.text}</p>
                                            {exp.media && (
                                                Array.isArray(exp.media) ? (
                                                    exp.media.map((mediaItem, index) => (
                                                        mediaItem.mediaType === 'video' ? (
                                                            <video key={index} src={mediaItem.mediaUrl} controls className="experience-video" />
                                                        ) : (
                                                            <img key={index} src={mediaItem.mediaUrl} alt="User experience" className="experience-img" />
                                                        )
                                                    ))
                                                ) : (
                                                    exp.media.mediaType === 'video' ? (
                                                        <video src={exp.media.mediaUrl} controls className="experience-video" />
                                                    ) : (
                                                        <img src={exp.media.mediaUrl} alt="User experience" className="experience-img" />
                                                    )
                                                )
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'help' && (
                <div className="tab-content">
                    <h2 className="section-title">Need Help?</h2>
                    <div className="help-info">
                        <p>📞 Call us: +91 12345 67890</p>
                        <p>📧 Email: support@bitebliss.com</p>
                        <p>🕒 Hours: 10 AM - 10 PM</p>
                    </div>
                    {!showChat ? (
                        <button className="chat-btn" onClick={() => setShowChat(true)}>
                            Chat with Support
                        </button>
                    ) : (
                        <div className="chat-container">
                            <button
                                className="chat-close-btn"
                                onClick={() => {
                                    setShowChat(false);
                                    setChatMessages([]);
                                }}
                            >
                                ×
                            </button>
                            <div className="chat-messages">
                                {chatMessages.length === 0 ? (
                                    <p className="empty-msg">Start a conversation with our support team.</p>
                                ) : (
                                    chatMessages.map((msg, i) => (
                                        <div key={i} className={`message ${msg.from}`}>
                                            {msg.text}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="chat-input">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type your message..."
                                />
                                <button onClick={handleChatSend}>Send</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'mybookings' && (
                <div className="tab-content">
                    <h2 className="section-title">My Bookings</h2>
                    {userBookings.length === 0 ? (
                        <p className="empty-msg">You have no bookings yet.</p>
                    ) : (
                        <ul className="booking-list">
                            {userBookings.map((booking, index) => (
                                <li key={booking._id || index} className="booking-item">
                                    <p><strong>Restaurant:</strong> {booking.restaurantId?.name || "N/A"}</p>
                                    <p><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {booking.bookingTime}</p>
                                    <p><strong>Guests:</strong> {booking.numberOfGuests}</p>
                                    {booking.specialRequests && <p><strong>Requests:</strong> {booking.specialRequests}</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default TableBooking;