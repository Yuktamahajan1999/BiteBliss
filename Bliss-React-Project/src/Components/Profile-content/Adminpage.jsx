/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getSocket, disconnectSocket } from '../socket';

const AdminPage = () => {
    const [applications, setApplications] = useState([]);
    const [partnerApplications, setPartnerApplications] = useState([]);
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentChatUser, setCurrentChatUser] = useState(null);
    const socketRef = useRef(null);
    const [chatUsers, setChatUsers] = useState([]);
    const navigate = useNavigate();

    function getUserId(msg) {
        if (!msg) return null;

        if (msg.userId && typeof msg.userId === 'object') {
            return msg.userId._id || msg.userId.$oid || null;
        }

        return msg.userId || null;
    }
    useEffect(() => {
        const fetchChatUsers = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chat/chatusers`);
                setChatUsers(res.data);
                if (!currentChatUser && res.data.length > 0) {
                    setCurrentChatUser(res.data[0]._id);
                }
            } catch (err) {
                console.error("Failed to fetch chat users:", err);
                if (err.response?.status === 401) navigate('/login');
            }
        };
        fetchChatUsers();
    }, []);
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }

        getSocket(localStorage.getItem('token')).then(socket => {
            socketRef.current = socket;

            const handleSocketMessage = (message) => {
                const msgUserId = getUserId(message);
                if (msgUserId && msgUserId === currentChatUser) {
                    setMessages(prev => {
                        if (message.tempId) {
                            const existingIndex = prev.findIndex(m => m.key === `temp-${message.tempId}`);
                            if (existingIndex >= 0) {
                                const newMessages = [...prev];
                                newMessages[existingIndex] = {
                                    ...message,
                                    key: message._id,
                                    timestamp: new Date(message.createdAt).toLocaleTimeString()
                                };
                                return newMessages;
                            }
                        }
                        return [
                            ...prev,
                            {
                                ...message,
                                key: message._id,
                                timestamp: new Date(message.createdAt).toLocaleTimeString()
                            }
                        ];
                    });
                }
            };

            const handleUserDisconnect = (disconnectedUserId) => {
                if (disconnectedUserId === currentChatUser) {
                    setMessages([]);
                    setCurrentChatUser(null);
                }
                setChatUsers(prevUsers => prevUsers.filter(user => user._id !== disconnectedUserId));
            };

            socketRef.current.on("connect", () => {
                if (currentChatUser) {
                    socketRef.current.emit("join", {
                        userId: currentChatUser,
                        role: "admin"
                    });
                }
            });

            socketRef.current.on("chatMessage", handleSocketMessage);
            socketRef.current.on("userDisconnected", handleUserDisconnect);
            socketRef.current.on("newMessageNotification", () => { });

            return () => {
                if (socketRef.current) {
                    socketRef.current.off("chatMessage", handleSocketMessage);
                    socketRef.current.off("userDisconnected", handleUserDisconnect);
                    socketRef.current.off("newMessageNotification");
                    disconnectSocket();
                }
            };
        });
    }, [currentChatUser, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appsRes, partnerRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/application/getApp`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        params: { refresh: false }
                    }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/partnerapp/getpartnerapp`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);
                setApplications(appsRes.data);
                setPartnerApplications(partnerRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                toast.error('Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!currentChatUser) return;

        const fetchMessages = async () => {
            try {
                console.log('Fetching messages for user:', currentChatUser);
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chat/chatmessage?userId=${currentChatUser}`);
                console.log('Messages received:', res.data);
                const formattedMessages = res.data.map(msg => ({
                    ...msg,
                    key: msg._id,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    sender: msg.sender || 'user'
                }));
                setMessages(formattedMessages);
            } catch (err) {
                console.error('Error fetching messages:', err);
                setMessages([]);
            }
        };

        fetchMessages();
    }, [currentChatUser]);
    useEffect(() => {
        if (!currentChatUser && chatUsers.length > 0) {
            setCurrentChatUser(chatUsers[0]._id);
        }
    }, [chatUsers]);

    const handleSend = () => {
        if (!text.trim() || !currentChatUser || !socketRef.current) return;

        const tempId = Date.now().toString();
        const message = {
            userId: currentChatUser,
            sender: "admin",
            text,
            tempId
        };

        setMessages(prev => [
            ...prev,
            {
                ...message,
                key: `temp-${tempId}`,
                timestamp: new Date().toLocaleTimeString()
            }
        ]);

        socketRef.current.emit("chatMessage", message);
        setText("");
    };
    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/application/statusApp?id=${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            const updatedApp = response.data.application;
            setApplications(prev => prev.map(app =>
                app._id === id ? { ...app, status: newStatus } : app
            ));

            if (newStatus === 'accepted') {
                if (updatedApp.position === 'Chef') {
                    await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL}/chefform`,
                        { applicationId: id, userId: updatedApp.user },
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    );
                }
                else if (updatedApp.position === 'Delivery Partner') {
                    await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL}/deliverypartner/createformapplication`,
                        { applicationId: id, userId: updatedApp.user },
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    );
                }
            }
            toast.success('Status updated successfully');
        } catch (err) {
            console.error('Status update failed:', err);
            toast.error(`Failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const handlePartnerStatusChange = async (id, newStatus) => {
        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/partnerapp/updatepartnerApp?id=${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setPartnerApplications(prev =>
                prev.map(app => app._id === id ? { ...app, status: newStatus } : app)
            );
            toast.success('Partner status updated successfully');
        } catch (err) {
            console.error('Partner status error:', err);
            toast.error(`Failed to update partner status: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/application/deleteApp?id=${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApplications(prev => prev.filter(app => app._id !== id));
            toast.success('Application deleted successfully');
        } catch (err) {
            console.error('Delete error:', err);
            toast.error(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const currentMessages = messages.filter(msg => {
        const msgUserId = getUserId(msg);
        return msgUserId && String(msgUserId) === String(currentChatUser);
    });

    return (
        <div className="admin-applications-container">
            <div className="admin-chat-container">
                <h2 className="admin-chat-title">Admin Chat</h2>
                <div className="admin-chat-users">
                    {chatUsers.map(user => (
                        <button
                            key={user._id}
                            className={`admin-user-btn ${currentChatUser === user._id ? 'active' : ''}`}
                            onClick={() => setCurrentChatUser(user._id)}
                        >
                            {user.name || user.email || `User ${user._id.toString().substring(0, 6)}`}
                        </button>
                    ))}
                </div>
                <div className="admin-chat-messages" key={currentChatUser}>
                    {currentMessages.length > 0 ? (
                        currentMessages.map((msg) => {
                            console.log('Rendering message:', msg);

                            const senderName = msg.sender === 'admin'
                                ? 'You'
                                : msg.userId?.name || 'User';

                            const timestamp = msg.createdAt
                                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Just now';

                            return (
                                <div
                                    key={msg._id || msg.key}
                                    className={`admin-message admin-${msg.sender}`}
                                >
                                    <div className="admin-message-content">
                                        <strong>{senderName}:</strong> {msg.text}
                                        <small className="message-time">{timestamp}</small>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-messages">No messages yet</div>
                    )}
                </div>
                {currentChatUser && (
                    <div className="admin-chat-input">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type your message..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            className="admin-input-field"
                        />
                        <button onClick={handleSend} className="admin-send-btn">Send</button>
                    </div>
                )}
            </div>
            <h1 className="admin-title">Applications</h1>
            {applications.length === 0 ? (
                <div className="no-applications-message">
                    <p>No applications found.</p>
                </div>
            ) : (
                <div className="applications-list">
                    {applications.map((app) => (
                        <div key={app._id} className={`application-card ${app.status}`}>
                            <div className="application-header">
                                <h3>{app.name}</h3>
                                <span className={`status-badge ${app.status}`}>{app.status}</span>
                            </div>
                            <div className="application-details">
                                <div className="detail-group">
                                    <label>Position:</label>
                                    <span>{app.position}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Email:</label>
                                    <span>{app.email}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Phone:</label>
                                    <span>{app.phone}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Experience:</label>
                                    <span>{app.experience}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Submitted:</label>
                                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="application-actions">
                                {(app.status === 'pending' || app.status === 'reviewed') && (
                                    <>
                                        {app.status !== 'accepted' && (
                                            <button onClick={() => handleStatusChange(app._id, 'accepted')}>Approve</button>
                                        )}
                                        {app.status !== 'rejected' && (
                                            <button onClick={() => handleStatusChange(app._id, 'rejected')}>Reject</button>
                                        )}
                                    </>
                                )}
                                {app.status === 'pending' && (
                                    <button onClick={() => handleStatusChange(app._id, 'reviewed')}>Mark as Reviewed</button>
                                )}
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(app._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <h1 className="admin-title" style={{ marginTop: '40px' }}>Partner Applications</h1>
            {partnerApplications.length === 0 ? (
                <div className="no-applications-message">
                    <p>No partner applications found.</p>
                </div>
            ) : (
                <div className="applications-list">
                    {partnerApplications.map((app) => (
                        <div key={app._id} className={`application-card ${app.status}`}>
                            <div className="application-header">
                                <h3>{app.businessName}</h3>
                                <span className={`status-badge ${app.status}`}>{app.status}</span>
                            </div>
                            <div className="application-details">
                                <div className="detail-group">
                                    <label>Owner:</label>
                                    <span>{app.ownerName}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Email:</label>
                                    <span>{app.email}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Phone:</label>
                                    <span>{app.phone}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Cuisine Type:</label>
                                    <span>{app.cuisineType}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Address:</label>
                                    <span>{app.address}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Submitted:</label>
                                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="application-actions">
                                {(app.status === 'pending' || app.status === 'reviewed') && (
                                    <>
                                        {app.status !== 'accepted' && (
                                            <button onClick={() => handlePartnerStatusChange(app._id, 'accepted')}>Approve</button>
                                        )}
                                        {app.status !== 'rejected' && (
                                            <button onClick={() => handlePartnerStatusChange(app._id, 'rejected')}>Reject</button>
                                        )}
                                    </>
                                )}
                                {app.status === 'pending' && (
                                    <button onClick={() => handlePartnerStatusChange(app._id, 'reviewed')}>Mark as Reviewed</button>
                                )}
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(app._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPage;