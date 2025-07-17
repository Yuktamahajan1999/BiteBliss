/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import { quickFixMeals as staticQuickFixMeals } from '../data';

const QuickFixMeals = () => {
  const [meals, setMeals] = useState(staticQuickFixMeals);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleMeal = (index) => {
    setExpandedMeal(expandedMeal === index ? null : index);
  };

  const isValidMeal = (meal) => {
    return (
      meal &&
      (meal.name || meal.title) &&
      Array.isArray(meal.ingredients) &&
      Array.isArray(meal.instructions)
    );
  };

  const getMealName = (meal) => meal.name || meal.title || '';

  const handleSearch = async () => {
    if (!search.trim()) {
      setMeals(staticQuickFixMeals);
      setError('');
      setMessage('');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/fixmeal/searchquickfixmeal`, {
        params: { query: search }
      });
      if (res.data.success) {
        setMeals(res.data.data);
        setMessage(`Source: ${res.data.source}`);
      } else {
        setMeals([]);
        setMessage('No results found');
      }
    } catch (err) {
      setError('Failed to fetch meals');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };
  const handleBackToAll = () => {
    setMeals(staticQuickFixMeals);
    setSearch('');
    setError('');
    setMessage('');
  };

  return (
    <div className="qfm-container">
      <h1 className="qfm-title">⏱️ Quick Fix Meals</h1>

      <div className="qfm-search-container">
        <input
          className="qfm-search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by ingredient or name"
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button
          className="qfm-search-button"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : "Search"}
        </button>
        {(search || message || meals !== staticQuickFixMeals) && (
          <button className="qfm-back-button" onClick={handleBackToAll}>
            Back to All
          </button>
        )}
      </div>

      {error && <div className="qfm-error-message">{error}</div>}
      {message && <div className="qfm-message">{message}</div>}

      <div className="qfm-meals">
        {meals.length === 0 ? (
          <div className="qfm-error-message">No quick meals available right now.</div>
        ) : (
          meals.map((meal, index) => {
            if (!isValidMeal(meal)) return null;

            return (
              <div key={`${getMealName(meal)}-${index}`} className="qfm-card">
                <div
                  className="qfm-card-header"
                  onClick={() => toggleMeal(index)}
                >
                  <h2 className="qfm-name">
                    {meal.emoji || '🥗'} {getMealName(meal)}
                    <span className="qfm-toggle-icon">
                      {expandedMeal === index ? '−' : '+'}
                    </span>
                  </h2>
                  {meal.time && (
                    <div className="qfm-time">
                      ⏱️ {meal.time}
                    </div>
                  )}
                  {meal.source === 'ai' && <span style={{ marginLeft: 8, color: 'purple' }}>AI</span>}
                  {meal.source === 'static' && <span style={{ marginLeft: 8, color: 'gray' }}>Static</span>}
                </div>
                {expandedMeal === index && (
                  <div className="qfm-card-content">
                    {meal.image && !meal.image.includes('example.com') && meal.image.trim() !== "" ? (
                      <img src={meal.image} alt={getMealName(meal)} className="qfm-media" />
                    ) : meal.video ? (
                      <video controls className="qfm-media">
                        <source src={meal.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="qfm-placeholder">
                        <img src="/default-food.jpg" alt="No image" className="qfm-media" />
                      </div>
                    )}

                    <div className="qfm-section">
                      <h3>Ingredients:</h3>
                      <ul>
                        {meal.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="qfm-section">
                      <h3>Instructions:</h3>
                      <ol>
                        {meal.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuickFixMeals;