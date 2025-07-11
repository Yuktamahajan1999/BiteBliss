/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
const Settings= () => {
  return (
    <div className="settings-overview-container">
      <h2 className="settings-title">⚙️ Settings</h2>

      <div className="settings-section">
        <h3>Notification Preferences</h3>
        <Link to="/settings/notifications" className="settings-link">Manage Notifications</Link>
      </div>

      <div className="settings-section">
        <h3>Edit Profile</h3>
        <Link to="/profilesection" className="settings-link">Edit Your Profile</Link>
      </div>
    </div>
  );
};

export default Settings;
