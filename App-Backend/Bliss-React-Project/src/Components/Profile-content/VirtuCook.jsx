/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';

const VirtuCook = () => {
  const features = [
    { title: "Restaurant Videos", icon: "🍽️", color: "#FF6B6B", path: '/restaurantvideos' },
    { title: "User Videos", icon: "📱", color: "#4ECDC4", path: '/uservideos' },
    { title: "Recipe Book", icon: "📖", color: "#45B7D1", path: '/recipebook' },
    { title: "Recipe of the Day", icon: "🌟", color: "#FFD166", path: '/dayrecipe' }
  ];

  return (
    <div className='virtu-cook-container'>
      <div className='virtu-container'>
        <h1 className='main-title'>Virtu<span>Cook</span></h1>
        <p className='tagline'>Where culinary passion meets digital experience</p>
      </div>

      <div className='features-grid'>
        {features.map((feature, index) => (
          <Link
            to={feature.path}
            key={index}
            style={{ textDecoration: 'none' }} 
          >
            <div
              className='feature-card'
              style={{ '--card-color': feature.color }}
            >
              <div className='feature-icon'>{feature.icon}</div>
              <h3 className='feature-title'>{feature.title}</h3>
              <div className='hover-content'>
                <p>Explore {feature.title.toLowerCase()}</p>
                <button className='explore-btn'>Discover →</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VirtuCook;
