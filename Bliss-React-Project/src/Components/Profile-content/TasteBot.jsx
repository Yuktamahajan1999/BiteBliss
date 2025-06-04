/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';

const tastebotFeatures = [
  {
    title: "Quick Fix Meals",
    icon: "🍳",
    color: "#B084CC",
    path: "/quickfixmeals",
    description: "Under 15-min delicious meals for busy days!"
  },
  {
    title: "Suggest Based on Mood",
    icon: "🥗",
    color: "#9AE19D",
    path: "/suggestmood",
    description: "Tell your mood, TasteBot suggests food!"
  },
  {
    title: "Famous Indian Dishes",
    icon: "🍛",
    color: "#FF6B6B",
    path: "/famousdishes",
    description: "Explore iconic dishes from every Indian state!"
  },
];

const TasteBot = () => {
  return (
    <div className="tastebot-container">
      <div className="tastebot-header">
        <h1 className="tastebot-title">Taste<span>Bot</span></h1>
        <p className="tastebot-tagline">Smart assistant for food lovers 🍽️</p>
      </div>

      <div className="tastebot-grid">
        {tastebotFeatures.map((feature, index) => (
          <Link
            to={feature.path}
            key={index}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="tastebot-card"
              style={{ '--card-color': feature.color }}
            >
              <div className="tastebot-icon">{feature.icon}</div>
              <h3 className="tastebot-feature-title">{feature.title}</h3>
              <p className="tastebot-description">{feature.description}</p>
              <div className="tastebot-hover">
                <button className="tastebot-button">Explore →</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TasteBot;



