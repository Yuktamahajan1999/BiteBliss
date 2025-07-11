/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import { foodItems } from '../data';
import { useNavigate } from 'react-router-dom';

const SearchModal = () => {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const messages = ['Restaurants name or dish', ...foodItems.map((item) => item.food)];
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/allrestaurants?food=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleItemClick = (food) => {
    navigate(`/allrestaurants?food=${encodeURIComponent(food)}`);
  };

  return (
    <div className='search-modal-container'>
      <h1 className='search-modal-heading'>Discover Amazing Food</h1>

      <div className='search-bar-wrapper'>
        <SearchIcon className='search-bar-icon-left' sx={{ fontSize: 28 }} onClick={handleSearch} />
        <input
          type='text'
          className='search-bar-input'
          placeholder={messages[index]}
          aria-label='Search restaurants or dishes'
          onChange={handleChange}
          value={query}
          onKeyDown={handleKeyDown}
        />
        <KeyboardVoiceIcon className='search-bar-icon-right' sx={{ fontSize: 28 }} />
      </div>

      <div className="gallery-grid">
        {foodItems.map((item) => (
          <div key={item.id} className='gallery-item' onClick={() => handleItemClick(item.food)}>
            <img src={item.image} alt={item.food} className='gallery-image' />
            <h2 className='gallery-title'>{item.food}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchModal;
