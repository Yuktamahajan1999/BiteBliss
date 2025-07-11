/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { FaMapMarkerAlt, FaPlus, FaPhone, FaHome, FaTrash } from "react-icons/fa";

const LocationPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const saveAddress = () => {
    if (address.trim() && phone.trim()) {
      setAddresses([...addresses, {
        id: Date.now(),
        address,
        phone,
        time: new Date().toLocaleString()
      }]);
      setAddress("");
      setPhone("");
    }
  };

  const deleteAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  return (
    <div className="location-container">
      <h1 className="location-title">
        <FaMapMarkerAlt className="location-icon" />
        Delivery Address
      </h1>
      
      <div className="location-input-group">
        <label className="location-label">
          <FaHome className="input-icon" />
          Address
        </label>
        <input
          type="text"
          className="location-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your full address"
        />
      </div>

      <div className="location-input-group">
        <label className="location-label">
          <FaPhone className="input-icon" />
          Phone Number
        </label>
        <input
          type="tel"
          className="location-input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
        />
      </div>

      <button onClick={saveAddress} className="location-save-btn">
        <FaPlus className="btn-icon" />
        Save Address
      </button>


      {addresses.length > 0 && (
        <div className="location-saved-list">
          <h2 className="location-saved-title">Saved Addresses</h2>
          {addresses.map((addr) => (
            <div key={addr.id} className="location-address-card">
              <div className="address-header">
                <h3 className="address-text">{addr.address}</h3>
                <button 
                  onClick={() => deleteAddress(addr.id)} 
                  className="delete-btn"
                >
                  <FaTrash />
                </button>
              </div>
              <p className="phone-text">
                <FaPhone className="phone-icon" />
                {addr.phone}
              </p>
              <p className="location-time">Added: {addr.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationPage;