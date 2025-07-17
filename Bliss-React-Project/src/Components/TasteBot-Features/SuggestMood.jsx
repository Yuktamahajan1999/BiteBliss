/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { recipes as staticRecipes } from '../data';

const SuggestMood = () => {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllMoods();
  }, []);

  const fetchAllMoods = async () => {
    setLoading(true);
    setError('');
    setSelectedMood(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/suggestmood/getAllMoodFood`);
      if (res.data.success && res.data.data?.length > 0) {
        setMoods(res.data.data);
      } else {
        setMoods(staticRecipes);
        setError(res.data.message || 'No moods found, showing static data.');
      }
    } catch (err) {
      setError('Error fetching moods, showing static data.');
      setMoods(staticRecipes);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      fetchAllMoods();
      return;
    }
    setLoading(true);
    setError('');
    setSelectedMood(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/suggestmood/searchmoodfood`, {
        params: { mood: searchInput }
      });
      if (res.data.success && res.data.data?.length > 0) {
        setMoods(res.data.data);
      } else {
        const staticFiltered = staticRecipes.filter(r =>
          r.mood.toLowerCase().includes(searchInput.trim().toLowerCase())
        );
        setMoods(staticFiltered);
        setError(res.data.message || 'No moods found, showing static data.');
      }
    } catch (err) {
      const staticFiltered = staticRecipes.filter(r =>
        r.mood.toLowerCase().includes(searchInput.trim().toLowerCase())
      );
      setMoods(staticFiltered);
      setError('Error searching moods, showing static data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    if (!e.target.value.trim()) {
      fetchAllMoods();
    }
  };

  const handleBackToAll = () => {
    setSearchInput('');
    setError('');
    setSelectedMood(null);
    fetchAllMoods();
  };

  return (
    <div className="mood-page-container">
      <div className="mood-header">
        <h1 className="mood-title">What&apos;s Your <span>Food Mood</span> Today?</h1>
        <p className="mood-tagline">Select how you&apos;re feeling and discover perfect dishes</p>
      </div>

      <div className="mood-search">
        <input
          type="text"
          placeholder="Type your mood (e.g. happy, cozy)..."
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        {(searchInput || selectedMood !== null) && (
          <button className="back-button" onClick={handleBackToAll} disabled={loading} style={{ marginLeft: 8 }}>
            Back to All
          </button>
        )}
      </div>

      {error && <div className="mood-error">{error}</div>}

      <div className="mood-grid">
        {moods.map((mood, index) => (
          <div
            key={mood._id?.$oid || mood._id || index}
            className={`mood-card ${selectedMood === index ? 'selected' : ''}`}
            style={{ backgroundColor: mood.color }}
            onClick={() => setSelectedMood(index)}
          >
            <div className="mood-emoji">{mood.emoji}</div>
            <h3 className="mood-card-title">{mood.mood}</h3>
            <p className="mood-card-description">{mood.description}</p>
          </div>
        ))}
      </div>

      {selectedMood !== null && moods[selectedMood] && (
        <div className="food-results">
          <h2 className="results-title">Perfect {moods[selectedMood].mood} Foods</h2>
          <div className="food-grid">
            {moods[selectedMood].foods.map((food, idx) => (
              <div className="food-card" key={food._id?.$oid || food._id || idx}>
                <div className="food-type">{food.type}</div>
                <h3 className="food-name">{food.name}</h3>
                <p className="food-time">{food.time}</p>
                <p className="food-description">{food.description}</p>
                <Link
                  to={`/recipedetail/${food.name.toLowerCase().replace(/ /g, '-')}`}
                  state={{ food }}
                  className="recipe-link"
                >
                  View Recipe →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestMood;