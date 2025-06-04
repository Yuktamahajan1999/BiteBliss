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

            toast.success("Table Booked", {
                position: "top-center",
                autoClose: 3000
            });
            setBookingId(res.data._id || res.data.booking?._id);
            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                bookingDate: '',
                bookingTime: '',
                numberOfGuests: '',
                specialRequests: '',
            });
        } catch (error) {
            console.error('Booking error:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Booking failed');
        }
    };

    const handleExperienceSubmit = async () => {
        if (!experienceInput.trim()) return;

        if (!bookingId) {
            alert('Please book a table before sharing an experience.');
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

            console.log('Experience added:', res.data);

            setExperiences(prev => [...prev, {
                text: experienceInput,
                media: selectedMedia ? {
                    url: selectedMedia.url,
                    type: selectedMedia.type
                } : null
            }]);

            setExperienceInput('');
            setSelectedMedia(null);
        } catch (error) {
            console.error('Experience error:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Failed to add experience');
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

    return (
        <div className="table-booking-container">
            <h1 className="page-title">Table Reservations</h1>

            <div className="tab-buttons">
                <button onClick={() => setActiveTab('form')} className={activeTab === 'form' ? 'active' : ''}>Book Table</button>
                <button onClick={() => setActiveTab('experience')} className={activeTab === 'experience' ? 'active' : ''}>Experiences</button>
                <button onClick={() => setActiveTab('help')} className={activeTab === 'help' ? 'active' : ''}>Help</button>
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
                                        exp.media.type.startsWith('video') ? (
                                            <video src={exp.media.url} controls className="experience-video" />
                                        ) : (
                                            <img src={exp.media.url} alt="User experience" className="experience-img" />
                                        )
                                    )}
                                </div>
                            ))
                        )}
                    </div>
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
        </div>
    )
}


export default TableBooking;
