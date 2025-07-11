/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Notifications = () => {
    const [notifications, setNotifications] = useState({
        enableAll: true,
        newsletters: true,
        promos: true,
        social: true,
        orders: true,
        important: true
    });

    const toggleNotification = (type) => {
        setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleSave = () => {
        console.log("Saved settings:", notifications);
        alert("Notification preferences saved!");
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <Link to="/settings" className="back-btn"><ArrowBackIcon /></Link>
                <h2>Settings</h2>
            </div>
            
            <div className="settings-section">
                <h3>Notification Preferences</h3>

                {[
                    { label: 'Enable all', key: 'enableAll' },
                    { label: 'Newsletters', key: 'newsletters' },
                    { label: 'Promos & Offers', key: 'promos' },
                    { label: 'Social Notifications', key: 'social' },
                    { label: 'Orders & Purchases', key: 'orders' },
                    { label: 'Important Updates', key: 'important' }
                ].map(item => (
                    <div className="notification-item" key={item.key}>
                        <span>{item.label}</span>
                        <Switch checked={notifications[item.key]} onChange={() => toggleNotification(item.key)} />
                    </div>
                ))}

                <button className="save-btn" onClick={handleSave}>Save Settings</button>
            </div>
        </div>
    );
};

export default Notifications;
