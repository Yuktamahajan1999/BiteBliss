/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { famousDishes } from '../data';

const FamousDishes = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleSection = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="fd-container">
      <h1 className="fd-title">🍛 Famous Local Dishes of Indian States</h1>

      {famousDishes.length === 0 ? (
        <div className="fd-error-message">No dishes data available.</div>
      ) : (
        <div className="fd-dishes">
          {famousDishes.map((item, index) => (
            <div key={`${item.state}-${index}`} className="fd-card">
              <h2 className="fd-state">{item.emoji} {item.dish} ({item.state})</h2>

              {item.image ? (
                <img src={item.image} alt={item.dish} className="fd-image" />
              ) : item.video ? (
                <video src={item.video} controls className="fd-video" />
              ) : (
                <div className="fd-placeholder">Media not available</div>
              )}


              <div className="fd-section">
                <strong>Description:</strong>
                <p>{item.description}</p>
              </div>

              <p className="fd-description">
                <button onClick={() => toggleSection(index)}>
                  {expandedIndex === index ? "Hide Details" : "Show Details"}
                </button>
              </p>

              {expandedIndex === index && (
                <>
                  <div className="fd-section">
                    <strong>Ingredients:</strong>
                    <ul>
                      {item.ingredients.map((ingredient, i) => (
                        <li key={i}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="fd-section">
                    <strong>Instructions:</strong>
                    <ol>
                      {item.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamousDishes;