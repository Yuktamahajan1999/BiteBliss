/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import { foodItems } from '../data';
import { Link } from 'react-router-dom';

const SearchModal = () => {
  const [query, setQuery] = useState('');
  const messages = ['Restaurants name or dish', ...foodItems.map((item) => item.food)];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  return (
    <div className='search-modal-container'>
      <h1 className='search-modal-heading'>Discover Amazing Food</h1>
      <div className='search-bar-wrapper'>
        <SearchIcon
          className='search-bar-icon-left'
          sx={{ fontSize: 28 }}
        />
        <input
          type='text'
          className='search-bar-input'
          placeholder={messages[index]}
          aria-label='Search restaurants or dishes'
          onChange={handleChange}
          value={query}
        />
        <KeyboardVoiceIcon
          className='search-bar-icon-right'
          sx={{ fontSize: 28 }}
        />
      </div>
      <Link to={`/restaurants?food=${query}`}>
        <div className="gallery-grid">
          {foodItems.map((item) => (
            <div key={item.id} className='gallery-item'>
              <img src={item.image} alt={item.food} className='gallery-image' />
              <h2 className='gallery-title'>{item.food}</h2>
            </div>
          ))}
        </div>
      </Link>
    </div>
  );
};

export default SearchModal;