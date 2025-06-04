/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const UserProfileSection = () => {
  const [profile, setProfile] = useState({
    name: "",
    mobile: "",
    email: "",
    gender: "",
    dob: null,
    profileImage: "",
    file: null
  });

  const [isSaved, setSaved] = useState(false);
  const [isExistingProfile, setIsExistingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedAvatar = location.state?.selectedAvatar || null;
  const avatarFile = location.state?.avatarFile || null;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      toast.error("No authorization token found, please login", { position: "top-center" });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8000/userprofile/getUserProfile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401) {
          toast.error("Unauthorized access. Please login.", { position: "top-center" });
          return;
        }

        const data = res.data;
        if (data) {
          setProfile({
            name: data.name || "",
            mobile: data.mobile || "",
            email: data.email || "",
            gender: data.gender || "",
            dob: data.dob ? new Date(data.dob) : null,
            profileImage: data.profileImage ? data.profileImage : "",
            file: null
          });
          setIsExistingProfile(true);
          setSaved(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("An error occurred while fetching profile", { position: "top-center" });
      }
    };

    fetchProfile();
  }, [token]);

useEffect(() => {
  if (selectedAvatar && avatarFile) {
    setProfile(prev => ({
      ...prev,
      profileImage: URL.createObjectURL(avatarFile), 
      file: avatarFile
    }));
    setIsEditing(true);
  } else if (selectedAvatar) {
    setProfile(prev => ({
      ...prev,
      profileImage: selectedAvatar.src,
      file: null
    }));
    setIsEditing(true);
  }
}, [selectedAvatar, avatarFile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({
        ...prev,
        profileImage: URL.createObjectURL(file), // preview
        file
      }));
      setIsEditing(true);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (!token) {
      toast.error("You are not logged in. Please login first.", { position: "top-center" });
      navigate('/login');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('mobile', profile.mobile);
      formData.append('email', profile.email);
      formData.append('gender', profile.gender);
      formData.append('dob', profile.dob ? profile.dob.toISOString() : '');

      if (profile.file) {
        formData.append('profileImage', profile.file);
      } else if (profile.profileImage) {
        formData.append('profileImage', profile.profileImage);
      }

      const url = isExistingProfile
        ? 'http://localhost:8000/userprofile/updateProfile'
        : 'http://localhost:8000/userprofile';

      const method = isExistingProfile ? axios.put : axios.post;

      await method(url, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      const updatedProfile = await axios.get("http://localhost:8000/userprofile/getUserProfile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile({
        name: updatedProfile.data.name || "",
        mobile: updatedProfile.data.mobile || "",
        email: updatedProfile.data.email || "",
        gender: updatedProfile.data.gender || "",
        dob: updatedProfile.data.dob ? new Date(updatedProfile.data.dob) : null,
        profileImage: updatedProfile.data.profileImage ? updatedProfile.data.profileImage : "",
        file: null
      });

      toast.success("Profile saved successfully!", { position: "top-center" });
      setSaved(true);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error(err.response?.data?.message || "An error occurred while saving profile", {
        position: "top-center"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete("http://localhost:8000/userprofile/deleteProfile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Profile deleted successfully", { position: "top-center" });
      setProfile({
        name: "",
        mobile: "",
        email: "",
        gender: "",
        dob: null,
        profileImage: "",
        file: null
      });
      setSaved(false);
      setIsExistingProfile(false);
    } catch (err) {
      console.error("Error deleting profile:", err);
      toast.error("An error occurred while deleting the profile", { position: "top-center" });
    }
  };

  return (
    <div className='user-profile-section-container'>
      <div className="user-profile-section">
        <div className="user-profile-picture-container">
          <div className="user-profile-picture-wrapper">
            <label htmlFor="profile-upload" className="user-profile-upload-label">
              <img
                src={
                  profile.file
                    ? profile.profileImage
                    : profile.profileImage
                      ? profile.profileImage
                      : "/default-avatar.png"
                }
                alt="Profile"
                className="user-profile-picture"
                key={profile.profileImage}
              />
              <input
                id="profile-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden-file-input"
              />
            </label>
          </div>

          <div className="user-profile-actions-container">
            <button
              type="button"
              className="user-profile-picture-action-btn"
              onClick={triggerFileInput}
            >
              <img
                src="/Icons/photo.gif"
                alt="Upload"
                className="user-avatar-icon"
              />
            </button>
            <Link to={'/avatarpage'}>
              <button type="button" className="user-profile-picture-action-btn">
                <img
                  src="/Icons/avatar.gif"
                  alt="Change avatar"
                  className="user-avatar-icon"
                />
              </button>
            </Link>
          </div>
        </div>

        <form className="user-profile-form" onSubmit={handleSave}>
          {["name", "mobile", "email"].map((field) => (
            <div key={field} className="user-form-group">
              <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type={field === "email" ? "email" : "text"}
                id={field}
                name={field}
                required
                className="user-form-input"
                placeholder={`Enter your ${field}`}
                value={profile[field]}
                onChange={handleInputChange}
                disabled={!isEditing && isSaved}
              />
            </div>
          ))}

          <div className="user-form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              required
              className="user-form-input"
              value={profile.gender}
              onChange={handleInputChange}
              disabled={!isEditing && isSaved}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="user-form-group">
            <label htmlFor="dob">Date of Birth</label>
            <DatePicker
              id="dob"
              selected={profile.dob}
              onChange={(date) => setProfile(prev => ({ ...prev, dob: date }))}
              className="user-form-input"
              placeholderText="Select your birthdate"
              dateFormat="dd-MM-yyyy"
              disabled={!isEditing && isSaved}
              maxDate={new Date()}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              required
            />
          </div>

          <div className="user-form-buttons">
            {!isSaved || isEditing ? (
              <button
                type="submit"
                className="user-save-btn"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : (isExistingProfile ? "Update" : "Save")}
              </button>
            ) : (
              <div className="profile-action-buttons">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="user-edit-btn"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="user-delete-btn"
                >
                  Delete Profile
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileSection;