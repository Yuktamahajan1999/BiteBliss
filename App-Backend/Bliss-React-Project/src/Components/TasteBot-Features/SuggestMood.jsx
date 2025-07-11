/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { recipes } from '../data';

const SuggestMood = () => {
  const [selectedMood, setSelectedMood] = useState(null);

  return (
    <div className="mood-page-container">
      <div className="mood-header">
        <h1 className="mood-title">What&apos;s Your <span>Food Mood</span> Today?</h1>
        <p className="mood-tagline">Select how you&apos;re feeling and discover perfect dishes</p>
      </div>

      <div className="mood-grid">
        {recipes.map((mood, index) => (
          <div
            key={index}
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

      {selectedMood !== null && (
        <div className="food-results">
          <h2 className="results-title">Perfect {recipes[selectedMood].mood} Foods</h2>
          <div className="food-grid">
            {recipes[selectedMood].foods.map((food, index) => (
              <div className="food-card" key={index}>
                <div className="food-type">{food.type}</div>
                <h3 className="food-name">{food.name}</h3>
                <p className="food-time">{food.time}</p>
                <p className="food-description">{food.description}</p>
                <Link
                  to={`/recipedetail/${food.name.toLowerCase().replace(/ /g, '-')}`}
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