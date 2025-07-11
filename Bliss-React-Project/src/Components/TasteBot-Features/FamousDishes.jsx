/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { famousDishes } from '../data';
import axios from 'axios';

const FamousDishes = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const toggleSection = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const res = await axios.get(`http://localhost:8000/dish/searchdish`, {
        params: { query: searchQuery }
      });

      if (res.data.success) {
        setSearchResults(res.data.data);
        if (res.data.source === 'static') setMessage('Showing local results');
        else if (res.data.source === 'database') setMessage('Showing database results');
        else if (res.data.source === 'openai') setMessage('Showing AI-generated results');
        else if (res.data.source === 'ai+static') setMessage('Showing AI & local results');
        else setMessage('');
        if (res.data.error) setError(res.data.error);
      } else {
        setError(res.data.message || 'No results found');
        setSearchResults([]);
      }
    } catch (err) {
      setError('Search unavailable - showing sample dishes');
      setSearchResults(famousDishes.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const displayDishes = searchResults.length > 0 ? searchResults : famousDishes;

  return (
    <div className="fd-container">
      <h1 className="fd-title">🍛 Famous Local Dishes of Indian States</h1>

      <div className="fd-search-container">
        <input
          type="text"
          placeholder="Search by dish or state"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="fd-search-input"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="fd-search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        {searchResults.length > 0 && searchQuery && (
          <button
            className="fd-back-button"
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setError(null);
              setMessage('');
            }}
            style={{ marginTop: "1rem", marginBottom: "1rem" }}
          >
            Back to All
          </button>
        )}
      </div>

      {loading && <div className="fd-loading">Searching dishes...</div>}
      {error && <div className="fd-error">{error}</div>}
      {message && <div className="fd-message">{message}</div>}

      <div className="fd-dishes">
        {displayDishes.map((item, index) => (
          <div key={`${item._id || index}-${item.dish}`} className="fd-card">
            <h2 className="fd-state">
              {item.emoji} {item.dish} ({item.state})
              {item.source === 'openai' && <span className="fd-ai-tag">AI</span>}
            </h2>

            {item.image ? (
              <img src={item.image} alt={item.dish} className="fd-image" />
            ) : item.video ? (
              <video src={item.video} controls className="fd-video" />
            ) : (
              <div className="fd-placeholder">No media</div>
            )}

            <div className="fd-section">
              <strong>Description:</strong>
              <p>{item.description}</p>
            </div>

            <button
              onClick={() => toggleSection(index)}
              className="fd-toggle-button"
            >
              {expandedIndex === index ? 'Hide Details' : 'Show Details'}
            </button>

            {expandedIndex === index && (
              <div className="fd-details">
                <div className="fd-section">
                  <strong>Ingredients:</strong>
                  <ul className="fd-ingredients">
                    {item.ingredients?.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div className="fd-section">
                  <strong>Instructions:</strong>
                  <ol className="fd-instructions">
                    {item.instructions?.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamousDishes;
