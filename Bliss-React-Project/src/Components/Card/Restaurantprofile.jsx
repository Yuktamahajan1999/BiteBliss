/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function RestaurantProfileForm() {
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    legalName: '',
    image: '',
    photos: [],
    description: '',
    cuisine: [],
    address: '',
    time: '',
    distance: '',
    fssaiNumber: '',
    gstNumber: '',
    contact: '',
    offer: '',
    deliveryAvailable: true,
    acceptingOrders: true,
    acceptingBookings: true,
    diningAvailability: true,
    petAllow: false,
    menu: [],
    restaurantowner: '',
    isOpen: true,
    openHours: {
      monday: { open: "10:00 AM", close: "10:00 PM" },
      tuesday: { open: "10:00 AM", close: "10:00 PM" },
      wednesday: { open: "10:00 AM", close: "10:00 PM" },
      thursday: { open: "10:00 AM", close: "10:00 PM" },
      friday: { open: "10:00 AM", close: "10:00 PM" },
      saturday: { open: "10:00 AM", close: "10:00 PM" },
      sunday: { open: "10:00 AM", close: "10:00 PM" }
    }
  });

  const [menuCategory, setMenuCategory] = useState({ name: '', description: '' });
  const [menuItem, setMenuItem] = useState({ name: '', description: '', price: '', type: 'veg', image: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [savedRestaurant, setSavedRestaurant] = useState(null);

  const checkIsOpenNow = (openHours) => {
    if (!openHours) return false;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const todayHours = openHours[currentDay];

    if (!todayHours || !todayHours.open || !todayHours.close) {
      return false;
    }

    const parseTime = (timeStr) => {
      if (!timeStr) return 0;

      const timePart = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!timePart) return 0;

      let hours = parseInt(timePart[1], 10);
      const minutes = parseInt(timePart[2], 10);
      const period = timePart[3] ? timePart[3].toUpperCase() : 'AM';

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return hours * 60 + minutes;
    };

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = parseTime(todayHours.open);
    const closeMinutes = parseTime(todayHours.close);

    if (closeMinutes < openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    } else {
      return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }
  };

  const getNextOpeningTime = (openHours) => {
    if (!openHours) return '';

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let currentDayIndex = now.getDay();

    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const day = days[dayIndex];
      const hours = openHours[day];

      if (hours && hours.open) {
        if (i === 0) {
          const openTime = parseTime(hours.open);
          const currentMinutes = now.getHours() * 60 + now.getMinutes();

          if (openTime > currentMinutes) {
            return `today at ${hours.open}`;
          }
        } else {
          const dayName = days[dayIndex].charAt(0).toUpperCase() + days[dayIndex].slice(1);
          return `${dayName} at ${hours.open}`;
        }
      }
    }

    return '';
  };

  const parseTime = (timeStr) => {
    const timePart = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!timePart) return 0;

    let hours = parseInt(timePart[1], 10);
    const minutes = parseInt(timePart[2], 10);
    const period = timePart[3] ? timePart[3].toUpperCase() : 'AM';

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  const validateTimeFormat = (timeStr) => {
    return /^([1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)?$/i.test(timeStr);
  };
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const ownerId = user?.id;
    if (!ownerId) return;

    const fetchOwnersRestaurant = async () => {
      try {
        const res = await axios.get('http://localhost:8000/restaurant/getAllrestaurant');
        const all = res.data?.data || [];
        const ownerRest = all.find(r => {
          if (!r.restaurantowner) return false;
          if (typeof r.restaurantowner === "object" && r.restaurantowner._id) {
            return r.restaurantowner._id === ownerId;
          }
          return r.restaurantowner === ownerId;
        });
        if (ownerRest) {
          setRestaurantId(ownerRest._id);
          setSavedRestaurant(ownerRest);
        } else {
          setRestaurantId(null);
          setSavedRestaurant(null);
        }
      } catch (error) {
        setRestaurantId(null);
        setSavedRestaurant(null);
      }
    };
    fetchOwnersRestaurant();
  }, []);

  useEffect(() => {
    if (editMode && savedRestaurant) {
      setRestaurantForm({
        ...restaurantForm,
        ...savedRestaurant,
        restaurantowner: typeof savedRestaurant.restaurantowner === 'object'
          ? savedRestaurant.restaurantowner._id
          : savedRestaurant.restaurantowner,
        photos: [],
      });
    }
  }, [editMode, savedRestaurant]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setRestaurantForm({ ...restaurantForm, [name]: checked });
    } else if (type === 'file') {
      if (name === 'photos') {
        setRestaurantForm({ ...restaurantForm, photos: Array.from(files) });
      }
    } else if (name === 'cuisine') {
      setRestaurantForm({ ...restaurantForm, cuisine: value.split(',').map(item => item.trim()) });
    } else {
      setRestaurantForm({ ...restaurantForm, [name]: value });
    }
  };

  const handleCategoryInput = (e) => setMenuCategory({ ...menuCategory, [e.target.name]: e.target.value });
  const handleItemInput = (e) => setMenuItem({ ...menuItem, [e.target.name]: e.target.value });

  const addMenuCategory = () => {
    if (menuCategory.name) {
      const updatedMenu = [...restaurantForm.menu, { ...menuCategory, items: [] }];
      setRestaurantForm({ ...restaurantForm, menu: updatedMenu });
      setMenuCategory({ name: '', description: '' });
      setSelectedCategory(updatedMenu.length - 1);
    }
  };

  const addMenuItem = () => {
    if (menuItem.name && menuItem.price && selectedCategory !== null) {
      const updatedMenu = [...restaurantForm.menu];
      updatedMenu[selectedCategory].items.push({
        name: menuItem.name,
        description: menuItem.description,
        price: parseFloat(menuItem.price),
        type: menuItem.type,
        image: menuItem.image
      });
      setRestaurantForm({ ...restaurantForm, menu: updatedMenu });
      setMenuItem({ name: '', description: '', price: '', type: 'veg', image: '' });
    }
  };

  const removeMenuCategory = (index) => {
    const updatedMenu = [...restaurantForm.menu];
    updatedMenu.splice(index, 1);
    setRestaurantForm({ ...restaurantForm, menu: updatedMenu });
    setSelectedCategory(null);
  };

  const removeMenuItem = (categoryIndex, itemIndex) => {
    const updatedMenu = [...restaurantForm.menu];
    updatedMenu[categoryIndex].items.splice(itemIndex, 1);
    setRestaurantForm({ ...restaurantForm, menu: updatedMenu });
  };

  const submitRestaurantForm = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const user = JSON.parse(localStorage.getItem('user'));
      const ownerId = user?.id;

      const formData = new FormData();
      for (const day in restaurantForm.openHours) {
        const { open, close } = restaurantForm.openHours[day];
        if (!validateTimeFormat(open) || !validateTimeFormat(close)) {
          toast.error(`Invalid time format for ${day}. Please use format like "09:00 AM"`);
          return;
        }
      }

      formData.append('image', restaurantForm.image);

      restaurantForm.photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const textFields = [
        'name', 'legalName', 'description', 'address',
        'time', 'distance', 'fssaiNumber', 'gstNumber',
        'contact', 'offer'
      ];
      textFields.forEach(field => {
        formData.append(field, restaurantForm[field]);
      });

      formData.append('restaurantowner', ownerId);

      const booleanFields = [
        'deliveryAvailable', 'acceptingOrders', 'acceptingBookings',
        'diningAvailability', 'petAllow', 'isOpen'
      ];
      booleanFields.forEach(field => {
        formData.append(field, restaurantForm[field]);
      });

      restaurantForm.cuisine.forEach(cuisine => {
        formData.append('cuisine', cuisine);
      });

      const sanitizedMenu = (restaurantForm.menu || []).map(cat => ({
        ...cat,
        items: Array.isArray(cat.items) ? cat.items : []
      }));
      formData.append('menu', JSON.stringify(sanitizedMenu));

      formData.append('openHours', JSON.stringify(restaurantForm.openHours));

      const apiUrl = editMode && restaurantId
        ? `http://localhost:8000/restaurant/updaterestaurant?id=${restaurantId}`
        : 'http://localhost:8000/restaurant';

      if (editMode && restaurantId) {
        await axios.put(apiUrl, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post(apiUrl, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      const res = await axios.get('http://localhost:8000/restaurant/getAllrestaurant');
      const all = res.data?.data || [];
      const ownerRest = all.find(r => {
        if (!r.restaurantowner) return false;
        if (typeof r.restaurantowner === "object" && r.restaurantowner._id) {
          return r.restaurantowner._id === ownerId;
        }
        return r.restaurantowner === ownerId;
      });

      if (ownerRest) {
        setSavedRestaurant(ownerRest);
        setRestaurantId(ownerRest._id);
      } else {
        setSavedRestaurant(null);
        setRestaurantId(null);
      }

      setEditMode(false);
    } catch (error) {
      console.error('Error submitting restaurant:', error);
    }
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role || '';

  if (userRole !== 'restaurantowner') {
    return (
      <div className="restaurant-form-container">
        <h2 className="restaurant-form-title">Restaurant Profile</h2>
        <p>Sorry, only restaurant owners can access this page.</p>
      </div>
    );
  }

  return (
    <div className="restaurant-form-container">
      <h2 className="restaurant-form-title">
        {editMode ? "Edit Your Restaurant Profile" : "Set Up Your Restaurant Profile"}
      </h2>
      <form className="restaurant-form" onSubmit={submitRestaurantForm}>
        <section className="restaurant-info-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-fields-grid">
            <div className="form-field">
              <label className="required-field">Restaurant Name</label>
              <input type="text" name="name" value={restaurantForm.name} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label className="required-field">Legal Name</label>
              <input type="text" name="legalName" value={restaurantForm.legalName} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label className="required-field">Main Image (URL)</label>
              <input type="text" name="image" value={restaurantForm.image} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label className="file-upload-label">
                <span className="file-upload-text">Upload Additional Photos</span>
                <input
                  type="file"
                  name="photos"
                  multiple
                  onChange={handleInputChange}
                  className="file-input-hidden"
                  accept="image/*"
                />
                <span className="file-upload-button">Choose Files</span>
                {restaurantForm.photos.length > 0 && (
                  <span className="file-selected-count">
                    {restaurantForm.photos.length} file(s) selected
                  </span>
                )}
              </label>
              <div className="photo-previews">
                {restaurantForm.photos.map((file, index) => (
                  <div key={index} className="photo-preview">
                    <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} width="80" />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-field full-width">
              <label>Description</label>
              <textarea name="description" value={restaurantForm.description} onChange={handleInputChange} rows={3} />
            </div>
            <div className="form-field">
              <label className="required-field">Cuisine</label>
              <input type="text" name="cuisine" value={restaurantForm.cuisine.join(', ')} onChange={handleInputChange} required />
            </div>
          </div>
        </section>

        <section className="contact-info-section">
          <h3 className="section-title">Contact & Legal Information</h3>
          <div className="form-fields-grid">
            <div className="form-field">
              <label className="required-field">Address</label>
              <input type="text" name="address" value={restaurantForm.address} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label className="required-field">Estimated Time (e.g., 30-40 mins)</label>
              <input type="text" name="time" value={restaurantForm.time} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label className="required-field">Delivery Distance (e.g., 5 km)</label>
              <input type="text" name="distance" value={restaurantForm.distance} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label className="required-field">FSSAI Number</label>
              <input type="text" name="fssaiNumber" value={restaurantForm.fssaiNumber} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label className="required-field">GST Number</label>
              <input type="text" name="gstNumber" value={restaurantForm.gstNumber} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label className="required-field">Contact Number</label>
              <input type="text" name="contact" value={restaurantForm.contact} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label>Any Ongoing Offers?</label>
              <input type="text" name="offer" value={restaurantForm.offer} onChange={handleInputChange} />
            </div>
          </div>
        </section>

        <section className="menu-builder-section">
          <h3 className="section-title">Menu Builder</h3>
          <div className="category-form">
            <h4 className="sub-section-title">Add New Category</h4>
            <div className="form-fields-grid">
              <div className="form-field">
                <label>Category Name</label>
                <input type="text" name="name" value={menuCategory.name} onChange={handleCategoryInput} placeholder="e.g., North Indian, Desserts" />
              </div>
              <div className="form-field">
                <label>Category Description</label>
                <input type="text" name="description" value={menuCategory.description} onChange={handleCategoryInput} placeholder="Short description of this category" />
              </div>
              <button type="button" onClick={addMenuCategory} className="btn btn-add">Add Category</button>
            </div>
          </div>
          <div className="categories-list">
            {restaurantForm.menu.map((category, catIndex) => (
              <div key={catIndex} className="category-card">
                <div className="category-header">
                  <h4 className="category-title">{category.name}</h4>
                  <p className="category-description">{category.description}</p>
                  <button type="button" onClick={() => removeMenuCategory(catIndex)} className="btn btn-remove">Remove Category</button>
                </div>
                {selectedCategory === catIndex && (
                  <div className="item-form">
                    <h5 className="sub-section-title">Add Item to {category.name}</h5>
                    <div className="form-fields-grid">
                      <div className="form-field">
                        <label>Item Name</label>
                        <input type="text" name="name" value={menuItem.name} onChange={handleItemInput} placeholder="e.g., Butter Chicken" />
                      </div>
                      <div className="form-field">
                        <label>Description</label>
                        <input type="text" name="description" value={menuItem.description} onChange={handleItemInput} placeholder="Short description" />
                      </div>
                      <div className="form-field">
                        <label>Price (₹)</label>
                        <input type="number" name="price" value={menuItem.price} onChange={handleItemInput} placeholder="e.g., 250" />
                      </div>
                      <div className="form-field">
                        <label>Type</label>
                        <select name="type" value={menuItem.type} onChange={handleItemInput}>
                          <option value="veg">Vegetarian</option>
                          <option value="non-veg">Non-Vegetarian</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Image URL (optional)</label>
                        <input type="text" name="image" value={menuItem.image} onChange={handleItemInput} placeholder="Paste image URL" />
                      </div>
                      <button type="button" onClick={addMenuItem} className="btn btn-add">Add Item</button>
                    </div>
                  </div>
                )}
                <div className="items-grid">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="menu-item-card">
                      <div className="item-details">
                        <h5 className="item-name">{item.name}</h5>
                        <p className="item-description">{item.description}</p>
                        <div className="item-meta">
                          <span className="item-price">₹{item.price}</span>
                          <span className={`item-type ${item.type}`}>
                            {item.type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                          </span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeMenuItem(catIndex, itemIndex)} className="btn btn-remove">Remove</button>
                    </div>
                  ))}
                </div>
                {selectedCategory !== catIndex && (
                  <button type="button" onClick={() => setSelectedCategory(catIndex)} className="btn btn-edit">Edit {category.name}</button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="restaurant-options-section">
          <h3 className="section-title">Restaurant Options</h3>
          <div className="options-grid">
            <label className="option-item">
              <input type="checkbox" name="deliveryAvailable" checked={restaurantForm.deliveryAvailable} onChange={handleInputChange} />
              Delivery Available
            </label>
            <label className="option-item">
              <input type="checkbox" name="acceptingOrders" checked={restaurantForm.acceptingOrders} onChange={handleInputChange} />
              Accepting Orders
            </label>
            <label className="option-item">
              <input type="checkbox" name="acceptingBookings" checked={restaurantForm.acceptingBookings} onChange={handleInputChange} />
              Accepting Bookings
            </label>
            <label className="option-item">
              <input type="checkbox" name="diningAvailability" checked={restaurantForm.diningAvailability} onChange={handleInputChange} />
              Dining Available
            </label>
            <label className="option-item">
              <input type="checkbox" name="petAllow" checked={restaurantForm.petAllow} onChange={handleInputChange} />
              Pets Allowed
            </label>
            <label className="option-item">
              <input type="checkbox" name="isOpen" checked={restaurantForm.isOpen} onChange={handleInputChange} />
              Currently Open
            </label>
          </div>
        </section>
        <div className="opening-hours-grid">
          {Object.entries(restaurantForm.openHours).map(([day, times]) => (
            <div key={day} className="time-row">
              <label>{day.charAt(0).toUpperCase() + day.slice(1)}:</label>
              <div className="time-input-group">
                <input
                  type="text"
                  placeholder="09:00 AM"
                  value={times.open}
                  onChange={(e) => {
                    const newOpenHours = { ...restaurantForm.openHours };
                    newOpenHours[day] = {
                      ...newOpenHours[day],
                      open: e.target.value
                    };
                    setRestaurantForm({ ...restaurantForm, openHours: newOpenHours });
                  }}
                />
              </div>
              <span>to</span>
              <div className="time-input-group">
                <input
                  type="text"
                  placeholder="10:00 PM"
                  value={times.close}
                  onChange={(e) => {
                    const newOpenHours = { ...restaurantForm.openHours };
                    newOpenHours[day] = {
                      ...newOpenHours[day],
                      close: e.target.value
                    };
                    setRestaurantForm({ ...restaurantForm, openHours: newOpenHours });
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="current-status-indicator">
          <p>Current Status:
            <span className={
              restaurantForm.isOpen &&
                checkIsOpenNow(restaurantForm.openHours) ?
                'status-open' : 'status-closed'
            }>
              {!restaurantForm.isOpen ? 'MANUALLY CLOSED' :
                checkIsOpenNow(restaurantForm.openHours) ? 'OPEN' : 'CLOSED'}
            </span>
          </p>
          {restaurantForm.isOpen && !checkIsOpenNow(restaurantForm.openHours) && (
            <p className="status-note">
              (Will open at {getNextOpeningTime(restaurantForm.openHours)})
            </p>
          )}
        </div>

        <section className="additional-info-section">
          <h3 className="section-title">Opening Hours</h3>
          <div className="opening-hours-grid">
            {Object.entries(restaurantForm.openHours).map(([day, times]) => (
              <div key={day} className="time-row">
                <label>{day.charAt(0).toUpperCase() + day.slice(1)}:</label>
                <div className="time-input-group">
                  <select
                    value={times.open ? times.open.split(' ')[1] || 'AM' : 'AM'}
                    onChange={(e) => {
                      const newOpenHours = { ...restaurantForm.openHours };
                      const timeValue = newOpenHours[day].open.split(' ')[0] || '10:00';
                      newOpenHours[day] = {
                        ...newOpenHours[day],
                        open: `${timeValue} ${e.target.value}`
                      };
                      setRestaurantForm({ ...restaurantForm, openHours: newOpenHours });
                    }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <input
                    type="time"
                    value={times.open ? times.open.split(' ')[0] : '10:00'}
                    onChange={(e) => {
                      const newOpenHours = { ...restaurantForm.openHours };
                      const ampm = newOpenHours[day].open.split(' ')[1] || 'AM';
                      newOpenHours[day] = {
                        ...newOpenHours[day],
                        open: `${e.target.value} ${ampm}`
                      };
                      setRestaurantForm({ ...restaurantForm, openHours: newOpenHours });
                    }}
                  />
                </div>
                <span>to</span>
                <div className="time-input-group">
                  <select
                    value={times.close ? times.close.split(' ')[1] || 'PM' : 'PM'}
                    onChange={(e) => {
                      const newOpenHours = { ...restaurantForm.openHours };
                      const timeValue = newOpenHours[day].close.split(' ')[0] || '10:00';
                      newOpenHours[day] = {
                        ...newOpenHours[day],
                        close: `${timeValue} ${e.target.value}`
                      };
                      setRestaurantForm({ ...restaurantForm, openHours: newOpenHours });
                    }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <input
                    type="time"
                    value={times.close ? times.close.split(' ')[0] : '10:00'}
                    onChange={(e) => {
                      const newOpenHours = { ...restaurantForm.openHours };
                      const ampm = newOpenHours[day].close.split(' ')[1] || 'PM';
                      newOpenHours[day] = {
                        ...newOpenHours[day],
                        close: `${e.target.value} ${ampm}`
                      };
                      setRestaurantForm({ ...restaurantForm, openHours: newOpenHours });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="current-status-indicator">
            <p>Current Status:
              <span className={checkIsOpenNow(restaurantForm.openHours) ? 'status-open' : 'status-closed'}>
                {checkIsOpenNow(restaurantForm.openHours) ? 'OPEN' : 'CLOSED'}
              </span>
            </p>
          </div>
        </section>

        <section className="owner-info-section">
          <h3 className="section-title">Owner Information</h3>
          <div className="form-field">
            <label className="required-field">Owner User ID</label>
            <input
              type="text"
              name="restaurantowner"
              value={restaurantForm.restaurantowner}
              onChange={handleInputChange}
              required
              disabled={editMode}
            />
            {editMode && <p className="form-note">Note: Owner ID cannot be changed after creation.</p>}
          </div>
        </section>

        <button type="submit" className="btn btn-submit">{editMode ? "Update Profile" : "Submit Profile"}</button>
      </form>

      {savedRestaurant && (
        <div className="restaurant-profile">
          <div className="restaurant-profile__card">
            <h2 className="restaurant-profile__title">Saved Restaurant Profile</h2>

            {savedRestaurant.image && (
              <img
                className="restaurant-profile__main-image"
                src={savedRestaurant.image}
                alt={savedRestaurant.name}
              />
            )}

            {savedRestaurant.photos && savedRestaurant.photos.length > 0 && (
              <div className="restaurant-profile__photos">
                <h4 className="restaurant-profile__subtitle">Additional Photos</h4>
                <div className="restaurant-profile__gallery">
                  {savedRestaurant.photos.map((photo, index) => (
                    <img
                      key={index}
                      className="restaurant-profile__gallery-image"
                      src={photo}
                      alt={`Restaurant photo ${index}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="restaurant-profile__info">
              <h3 className="restaurant-profile__name">{savedRestaurant.name}</h3>
              <p><strong>Legal Name:</strong> {savedRestaurant.legalName}</p>
              <p><strong>Description:</strong> {savedRestaurant.description}</p>
              <p><strong>Cuisine:</strong> {Array.isArray(savedRestaurant.cuisine) ? savedRestaurant.cuisine.join(', ') : savedRestaurant.cuisine}</p>
              <p><strong>Address:</strong> {savedRestaurant.address}</p>
              <p><strong>Estimated Time:</strong> {savedRestaurant.time}</p>
              <p><strong>Delivery Distance:</strong> {savedRestaurant.distance}</p>
              <p><strong>FSSAI Number:</strong> {savedRestaurant.fssaiNumber}</p>
              <p><strong>GST Number:</strong> {savedRestaurant.gstNumber}</p>
              <p><strong>Contact:</strong> {savedRestaurant.contact}</p>
              <p><strong>Current Offers:</strong> {savedRestaurant.offer || 'None'}</p>
            </div>

            <div className="restaurant-profile__options">
              <h4 className="restaurant-profile__subtitle">Restaurant Options</h4>
              <ul className="restaurant-profile__list">
                <li>Delivery Available: {savedRestaurant.deliveryAvailable ? 'Yes' : 'No'}</li>
                <li>Accepting Orders: {savedRestaurant.acceptingOrders ? 'Yes' : 'No'}</li>
                <li>Accepting Bookings: {savedRestaurant.acceptingBookings ? 'Yes' : 'No'}</li>
                <li>Dining Available: {savedRestaurant.diningAvailability ? 'Yes' : 'No'}</li>
                <li>Pets Allowed: {savedRestaurant.petAllow ? 'Yes' : 'No'}</li>
                <li>Currently Open: {savedRestaurant.isOpen ? 'Yes' : 'No'}</li>
              </ul>
            </div>

            <div className="restaurant-profile__hours">
              <h4 className="restaurant-profile__subtitle">Open Hours</h4>
              <ul className="restaurant-profile__list">
                {savedRestaurant.openHours && Object.entries(savedRestaurant.openHours).map(([day, times]) =>
                  <li key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}: {times.open} to {times.close}</li>
                )}
              </ul>
            </div>

            {savedRestaurant.menu && savedRestaurant.menu.length > 0 && (
              <div className="restaurant-profile__menu">
                <h4 className="restaurant-profile__subtitle">Menu</h4>
                {savedRestaurant.menu.map((category, catIndex) => (
                  <div key={catIndex} className="restaurant-profile__menu-category">
                    <h5 className="restaurant-profile__menu-category-name">{category.name}</h5>
                    <p className="restaurant-profile__menu-category-desc">{category.description}</p>
                    <ul className="restaurant-profile__menu-items">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="restaurant-profile__menu-item">
                          <div className="restaurant-profile__menu-item-header">
                            <strong>{item.name}</strong> - ₹{item.price}
                            <span className={`restaurant-profile__menu-item-type ${item.type}`}>
                              ({item.type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'})
                            </span>
                          </div>
                          <p className="restaurant-profile__menu-item-desc">{item.description}</p>
                          {item.image && (
                            <img
                              className="restaurant-profile__menu-item-image"
                              src={item.image}
                              alt={item.name}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <button
              className="restaurant-profile__edit-btn"
              onClick={() => setEditMode(true)}
            >
              Edit This Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantProfileForm;