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

  const [initialProfile, setInitialProfile] = useState(null);
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
    const fetchAndSetProfile = async () => {
      if (!token) {
        toast.error("No authorization token found, please login", { position: "top-center" });
        return;
      }

      let profileData = null;
      try {
        const res = await axios.get("http://localhost:8000/userprofile/getUserProfile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          toast.error("Unauthorized access. Please login.", { position: "top-center" });
          return;
        }
        profileData = res.data;
      } catch (err) {
        profileData = null;
      }

      let updatedProfile = {
        name: profileData?.name || "",
        mobile: profileData?.mobile || "",
        email: profileData?.email || "",
        gender: profileData?.gender || "",
        dob: profileData?.dob ? new Date(profileData.dob) : null,
        profileImage: profileData?.profileImage || "",
        file: null
      };

      if (avatarFile) {
        const objectUrl = URL.createObjectURL(avatarFile);
        updatedProfile.profileImage = objectUrl;
        updatedProfile.file = avatarFile;
        setIsEditing(true);
      } else if (selectedAvatar) {
        updatedProfile.profileImage = selectedAvatar;
        setIsEditing(true);
      }

      setProfile(updatedProfile);
      setInitialProfile(updatedProfile);
      setIsExistingProfile(!!profileData);
      setSaved(!!profileData);

      return () => {
        if (avatarFile) URL.revokeObjectURL(updatedProfile.profileImage);
      };
    };

    fetchAndSetProfile();
  }, [token, location.state]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setProfile(prev => ({
        ...prev,
        profileImage: objectUrl,
        file
      }));
      setIsEditing(true);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setIsEditing(true);
  };

  const isProfileChanged = () => {
    if (!initialProfile) return true;
    const current = { ...profile, dob: profile.dob?.toISOString() };
    const initial = { ...initialProfile, dob: initialProfile.dob?.toISOString() };
    delete current.file;
    delete initial.file;
    return JSON.stringify(current) !== JSON.stringify(initial);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isProfileChanged()) {
      toast.info("No changes to save", { position: "top-center" });
      return;
    }

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
      } else {
        formData.append('profileImageUrl', profile.profileImage);
      }

      const url = isExistingProfile
        ? 'http://localhost:8000/userprofile/updateProfile'
        : 'http://localhost:8000/userprofile';
      const method = isExistingProfile ? axios.put : axios.post;

      await method(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedProfile = await axios.get("http://localhost:8000/userprofile/getUserProfile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newProfile = {
        name: updatedProfile.data.name || "",
        mobile: updatedProfile.data.mobile || "",
        email: updatedProfile.data.email || "",
        gender: updatedProfile.data.gender || "",
        dob: updatedProfile.data.dob ? new Date(updatedProfile.data.dob) : null,
        profileImage: updatedProfile.data.profileImage || "",
        file: null
      };

      setProfile(newProfile);
      setInitialProfile(newProfile);
      toast.success("Profile saved successfully!", { position: "top-center" });
      setSaved(true);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred while saving profile", {
        position: "top-center"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;

    try {
      await axios.delete("http://localhost:8000/userprofile/deleteProfile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Profile deleted successfully", { position: "top-center" });
      const emptyProfile = {
        name: "",
        mobile: "",
        email: "",
        gender: "",
        dob: null,
        profileImage: "",
        file: null
      };
      setProfile(emptyProfile);
      setInitialProfile(emptyProfile);
      setSaved(false);
      setIsExistingProfile(false);
    } catch (err) {
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
                src={profile.profileImage || "/default-avatar.png"}
                alt="Profile"
                className="user-profile-picture"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
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
              <img src="/Icons/photo.gif" alt="Upload" className="user-avatar-icon" />
            </button>
            <Link to={'/avatarpage'}>
              <button type="button" className="user-profile-picture-action-btn">
                <img src="/Icons/avatar.gif" alt="Change avatar" className="user-avatar-icon" />
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
              onChange={(date) => {
                setProfile(prev => ({ ...prev, dob: date }));
                setIsEditing(true);
              }}
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
              <button type="submit" className="user-save-btn" disabled={isSaving}>
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
