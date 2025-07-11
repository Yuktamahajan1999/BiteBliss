/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AvatarPage = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const navigate = useNavigate();

  const maleAvatars = [
    { id: 'male1', src: '/Avatar-images/male-avatar1.avif' },
    { id: 'male2', src: '/Avatar-images/male-avatar2.avif' },
    { id: 'male3', src: '/Avatar-images/male-avatar3.avif' },
    { id: 'male4', src: '/Avatar-images/male-avatar4.avif' },
    { id: 'male5', src: '/Avatar-images/male-avatar5.avif' },
    { id: 'male6', src: '/Avatar-images/male-avatar6.jpg' },
    { id: 'male7', src: '/Avatar-images/male-avatar7.avif' },
    { id: 'male8', src: '/Avatar-images/male-avatar8.jpeg' },
    { id: 'male9', src: '/Avatar-images/male-avatar9.avif' },
    { id: 'male10', src: '/Avatar-images/male-avatar10.jpg' },
  ];

  const femaleAvatars = [
    { id: 'female1', src: '/Avatar-images/female-avatar1.webp' },
    { id: 'female2', src: '/Avatar-images/female-avatar2.webp' },
    { id: 'female3', src: '/Avatar-images/female-avatar3.jpg' },
    { id: 'female4', src: '/Avatar-images/female-avatar4.webp' },
    { id: 'female5', src: '/Avatar-images/female-avatar5.jpg' },
    { id: 'female6', src: '/Avatar-images/female-avatar6.avif' },
    { id: 'female7', src: '/Avatar-images/female-avatar7.webp' },
    { id: 'female8', src: '/Avatar-images/female-avatar8.jpg' },
    { id: 'female9', src: '/Avatar-images/female-avatar9.png' },
    { id: 'female10', src: '/Avatar-images/female-avatar10.webp' },
  ];

  const handleAvatarClick = (avatar, gender) => {
    setSelectedAvatar({ ...avatar, gender });
  };

  const handleConfirmSelection = async () => {
    if (!selectedAvatar) return;
    const response = await fetch(selectedAvatar.src);
    const blob = await response.blob();
    const file = new File(
      [blob],
      selectedAvatar.id + selectedAvatar.src.substr(selectedAvatar.src.lastIndexOf('.')),
      { type: blob.type }
    );
    navigate('/profilesection', { state: { selectedAvatar, avatarFile: file } });
  };

  return (
    <div className="avatar-page-container">
      <button onClick={() => navigate('/profilesection')} className="back-button">
        &larr; Back to Profile
      </button>

      <h1>Choose Your Avatar</h1>

      <div className="avatar-sections-container">
        <section className="avatar-section">
          <h2>Male</h2>
          <div className="avatar-grid">
            {maleAvatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`avatar-circle ${selectedAvatar?.id === avatar.id && selectedAvatar?.gender === 'male'
                    ? 'selected'
                    : ''
                  }`}
                onClick={() => handleAvatarClick(avatar, 'male')}
              >
                <img src={avatar.src} alt="Male avatar" />
              </div>
            ))}
          </div>
        </section>

        <section className="avatar-section">
          <h2>Female</h2>
          <div className="avatar-grid">
            {femaleAvatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`avatar-circle ${selectedAvatar?.id === avatar.id && selectedAvatar?.gender === 'female'
                    ? 'selected'
                    : ''
                  }`}
                onClick={() => handleAvatarClick(avatar, 'female')}
              >
                <img src={avatar.src} alt="Female avatar" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="confirm-button-container">
        <button
          className="confirm-button"
          onClick={handleConfirmSelection}
          disabled={!selectedAvatar}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default AvatarPage;
