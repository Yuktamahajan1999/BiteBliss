/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { cuisines, popularDishes, restaurantTypes, cities, topRestaurantChains } from "../data";

const ExploreOptions = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef([]);

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleClickOutside = (event) => {
    if (dropdownRefs.current.every(ref => ref && !ref.contains(event.target))) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdowns = [
    { 
      title: "Popular Cuisines Near Me", 
      items: cuisines,
      icon: "fa-utensils" 
    },
    { 
      title: "Popular Dishes", 
      items: popularDishes,
      icon: "fa-bowl-food" 
    },
    { 
      title: "Restaurant Types", 
      items: restaurantTypes,
      icon: "fa-store" 
    },
    { 
      title: "Cities", 
      items: cities,
      icon: "fa-city" 
    },
    { 
      title: "Top Restaurant Chains", 
      items: topRestaurantChains,
      icon: "fa-chess-queen" 
    }
  ];

  return (
    <div className="explore-options-container">
      <h2>
        <i className="fa fa-compass icon-title"></i> Explore Options
      </h2>
      <div className="dropdowns-container">
        {dropdowns.map((dropdown, index) => (
          <div 
            key={index}
            className={`dropdown ${activeDropdown === index ? 'active' : ''}`}
            ref={el => dropdownRefs.current[index] = el}
          >
            <button 
              className="dropdown-btn"
              onClick={() => toggleDropdown(index)}
            >
              <i className={`fa ${dropdown.icon} icon-left`}></i>
              {dropdown.title}
              <i className={`fa fa-caret-down dropdown-icon ${activeDropdown === index ? 'rotate' : ''}`}></i>
            </button>
            
            <div className={`dropdown-content ${activeDropdown === index ? 'show' : ''}`}>
              {dropdown.items.map((item, itemIndex) => (
                <a
                  key={itemIndex}
                  href="#"
                  className="dropdown-item"
                >
                  <i className="fa fa-chevron-right icon-item"></i>
                  {item}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreOptions;