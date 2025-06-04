/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { Link } from "react-router-dom";

const Gallery = ({ data, title }) => {
  return (
    <div className="gallery-container">
      <h3 className="sub-head">{title}</h3>
      <div className="gallery-wrapper">
        {data.map((item, index) => (
          <div className="gallery-section" key={index}>
            <Link
              to={`restaurants.html?food=${encodeURIComponent(item.altText)}&offer=${item.offer || false}`}
            >
              <img
                src={item.imgSrc}
                alt={item.altText}
                className="gallery-image"
              />
              <h4 className="food-item">{item.altText}</h4>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const GalleryRestaurants = ({ data, itemsPerPage, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  function prevClick() {
    setCurrentIndex((prev) => (prev - itemsPerPage + data.length) % data.length);
  }

  function nextClick() {
    setCurrentIndex((next) => (next + itemsPerPage) % data.length);
  }

  const itemsToDisplay = data.slice(currentIndex, currentIndex + itemsPerPage);
  if (itemsToDisplay.length < itemsPerPage) {
    itemsToDisplay.push(...data.slice(0, itemsPerPage - itemsToDisplay.length));
  }

  return (
    <div className="container gallery-restaurant-container">
      <div className="container-box">
        <button onClick={prevClick} className="prev-btn"><SkipPreviousIcon /></button>
        <div className="gallery-container">
          <h4 className="sub-head">{title}</h4>
          <div className="gallery-wrapper">
            {itemsToDisplay.map((restaurant, index) => (
              <div className="gallery-section-restaurants" key={index}>
                <Link
                  to={`/restaurant-detail?name=${encodeURIComponent(restaurant.name)}`} 
                >
                <div className="custom-card-restaurants">
                  <img src={restaurant.image} alt={restaurant.alt} className="custom-card-media" />
                  <div className="card-content">
                    <h6 className="restaurant-name-list">{restaurant.name}</h6>
                  </div>
                </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
        <button onClick={nextClick} className="next-btn"><SkipNextIcon /></button>
      </div>
    </div>
  );
};


export { Gallery, GalleryRestaurants };
