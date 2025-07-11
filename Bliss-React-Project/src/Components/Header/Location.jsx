// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaPhone,
  FaHome,
  FaTrash,
  FaUser,
  FaGlobeAmericas,
} from "react-icons/fa";

const LocationPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchAddresses = async () => {
    try {
      const res = await axios.get("http://localhost:8000/address/getAddress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses(res.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const saveAddress = async () => {
    if (name && address && phone && pincode) {
      const payload = { name, address, phone, pincode, city, state, country };

      try {
        if (editingId) {
          await axios.put(
            `http://localhost:8000/address/updateAddress?id=${editingId}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          await axios.post("http://localhost:8000/address/createAddress", payload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        }
        setName("");
        setAddress("");
        setPhone("");
        setPincode("");
        setCity("");
        setState("");
        setCountry("");
        setEditingId(null);
        fetchAddresses();
      } catch (error) {
        console.error("Error saving address:", error);
      }
    }
  };

  const deleteAddress = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/address/deleteAddress?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const editAddress = (addr) => {
    setName(addr.name || "");
    setAddress(addr.address || "");
    setPhone(addr.phone || "");
    setPincode(addr.pincode || "");
    setCity(addr.city || "");
    setState(addr.state || "");
    setCountry(addr.country || "");
    setEditingId(addr._id);
  };

  return (
    <div className="location-container">
      <h1 className="location-title">
        <FaMapMarkerAlt className="location-icon" />
        Delivery Address
      </h1>

      <div className="location-input-group">
        <label className="location-label">
          <FaUser className="input-icon" />
          Name
        </label>
        <input
          type="text"
          className="location-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Recipient name"
        />
      </div>

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
          placeholder="Full address"
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
          placeholder="Phone number"
        />
      </div>

      <div className="location-input-group">
        <label className="location-label">Pincode</label>
        <input
          type="text"
          className="location-input"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="ZIP / Pincode"
        />
      </div>

      <div className="location-input-group">
        <label className="location-label">City</label>
        <input
          type="text"
          className="location-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
        />
      </div>

      <div className="location-input-group">
        <label className="location-label">State</label>
        <input
          type="text"
          className="location-input"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="State"
        />
      </div>

      <div className="location-input-group">
        <label className="location-label">
          <FaGlobeAmericas className="input-icon" />
          Country
        </label>
        <input
          type="text"
          className="location-input"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
        />
      </div>

      <button onClick={saveAddress} className="location-save-btn">
        <FaPlus className="btn-icon" />
        {editingId ? "Update Address" : "Save Address"}
      </button>

      {addresses.length > 0 && (
        <div className="location-saved-list">
          <h2 className="location-saved-title">Saved Addresses</h2>
          {addresses.map((addr) => (
            <div key={addr._id} className="location-address-card">
              <div className="address-header">
                <h3 className="address-text">{addr.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => editAddress(addr)} className="edit-btn">Edit</button>
                  <button onClick={() => deleteAddress(addr._id)} className="delete-btn">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p>{addr.address}</p>
              <p>{addr.city}, {addr.state}, {addr.pincode}</p>
              <p>{addr.country}</p>
              <p className="phone-text">
                <FaPhone className="phone-icon" />
                {addr.phone}
              </p>
              <p className="location-time">Added: {new Date(addr.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationPage;
