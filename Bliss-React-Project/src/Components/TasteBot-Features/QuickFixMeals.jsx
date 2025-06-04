/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { quickFixMeals } from '../data';

const QuickFixMeals = () => {
  const [expandedMeal, setExpandedMeal] = useState(null);

  const toggleMeal = (index) => {
    setExpandedMeal(expandedMeal === index ? null : index);
  };

  const isValidMeal = (meal) => {
    return meal && meal.title && Array.isArray(meal.ingredients) && Array.isArray(meal.instructions);
  };

  return (
    <div className="qfm-container">
      <h1 className="qfm-title">⏱️ Quick Fix Meals</h1>

      {quickFixMeals.length === 0 ? (
        <div className="qfm-error-message">No quick meals available right now.</div>
      ) : (
        <div className="qfm-meals">
          {quickFixMeals.map((meal, index) => {
            if (!isValidMeal(meal)) return null;

            return (
              <div key={`${meal.name}-${index}`} className="qfm-card">
                <div 
                  className="qfm-card-header" 
                  onClick={() => toggleMeal(index)}
                >
                  <h2 className="qfm-name">
                    {meal.emoji || '🥗'} {meal.name}
                    <span className="qfm-toggle-icon">
                      {expandedMeal === index ? '−' : '+'}
                    </span>
                  </h2>
                  {meal.time && (
                    <div className="qfm-time">
                      ⏱️ {meal.time} mins
                    </div>
                  )}
                </div>

                {expandedMeal === index && (
                  <div className="qfm-card-content">
                    {/* Media */}
                    {meal.image ? (
                      <img src={meal.image} alt={meal.name} className="qfm-media" />
                    ) : meal.video ? (
                      <video controls className="qfm-media">
                        <source src={meal.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="qfm-placeholder">No image or video available</div>
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
          })}
        </div>
      )}
    </div>
  );
};

export default QuickFixMeals;