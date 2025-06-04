/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import { galleryItems } from '../data';
import { Link, useNavigate } from 'react-router-dom';

const SearchBar = ({ SearchItem, LocationItem, showLocationBar, showSearchBar }) => {
  const messages = ['Restaurants name or dish', ...galleryItems.map((item) => item.food)];
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval); 
  }, [messages.length]);

  function SearchBarHandleClick() {
    navigate('/searchmodal');
  }

  return (
    <div className='search-section'>
      <div className='search-container'>
        {showLocationBar && (
          <div className='location-container'>
            <Link to='/location' className='location-link'>
              <img src='./Images/location.gif' alt='Location' className='location-icon' />
            </Link>
          </div>
        )}

        {showSearchBar && (
          <div className='search-button' onClick={SearchBarHandleClick}>
            <SearchIcon className='search-icon' />
            <input
              type='text'
              className='search-bar'
              placeholder={`Search "${messages[index]}"`}
              aria-label='Search'
            />
            <KeyboardVoiceIcon className='voice-icon' />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;