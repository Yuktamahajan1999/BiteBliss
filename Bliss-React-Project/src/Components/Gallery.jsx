/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { Link } from "react-router-dom";
import axios from "axios";

const Gallery = ({ data, title }) => {
  return (
    <div className="gallery-container">
      <h3 className="sub-head">{title}</h3>
      <div className="gallery-wrapper">
        {data.map((item, index) => (
          <div className="gallery-section" key={index}>
            <Link
              to={{
                pathname: "/allrestaurants",
                search: `?food=${encodeURIComponent(item.altText)}`
              }}
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

const GalleryRestaurants = ({ itemsPerPage = 4, title }) => {
  const [restaurantData, setRestaurantData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevClick = () => {
    setCurrentIndex((prev) => (prev - itemsPerPage + restaurantData.length) % restaurantData.length);
  };

  const nextClick = () => {
    setCurrentIndex((next) => (next + itemsPerPage) % restaurantData.length);
  };

  const itemsToDisplay = (() => {
    const slice = restaurantData.slice(currentIndex, currentIndex + itemsPerPage);
    if (slice.length < itemsPerPage) {
      return [...slice, ...restaurantData.slice(0, itemsPerPage - slice.length)];
    }
    return slice;
  })();

  useEffect(() => {
    const fetchTopRestaurants = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/restaurant/getAllrestaurant?top=10`
        );
        if (response.data.success) {
          setRestaurantData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch top restaurants:", error);
      }
    };

    fetchTopRestaurants();
  }, []);

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
                  to={`/restaurantdetails/${restaurant._id}`}
                >
                  <div className="custom-card-restaurants">
                    <img src={restaurant.image} alt={restaurant.alt} className="custom-card-media" />
                    <div className="card-content">
                      <h6 className="restaurant-name-list">{restaurant.name}</h6>
                      {restaurant.cuisines && (
                        <div className="cuisine-tags">
                          {restaurant.cuisines.map((cuisine, i) => (
                            <span key={i} className="tag">{cuisine}</span>
                          ))}
                        </div>
                      )}
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
