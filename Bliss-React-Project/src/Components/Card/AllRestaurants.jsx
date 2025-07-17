/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AllRestaurantsByFood = () => {
  const query = useQuery();
  const food = query.get("food");
  const type = query.get("type");
  const chain = query.get("chain");
  const price = query.get("price");

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getRestaurantsdetails = async () => {
      try {

        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/restaurant/getAllrestaurant`);
        const all = res.data?.data || [];


        let filtered = all;

        if (food) {
          const searchTerm = food.toLowerCase().replace(' near me', '');

          filtered = filtered.filter(r =>
            r.menu?.some(category =>
              category.items?.some(dish =>
                dish?.name?.toLowerCase().includes(searchTerm)
              )
            )
          );
        }

        if (type) {
          filtered = filtered.filter(r =>
            r.type?.toLowerCase().includes(type)
          );
        }
        if (chain) {
          const chainSearch = chain.toLowerCase().replace("'", ""); 
          filtered = filtered.filter(r =>
            r.name?.toLowerCase().replace("'", "").includes(chainSearch)
          );
        }

        setRestaurants(filtered);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    getRestaurantsdetails();
  }, [food, type, chain]);


  const handleCardClick = (id) => {
    navigate(`/restaurantdetails/${id}`);
  };

  const searchLabel = food
    ? `Restaurants Serving ${food}`
    : type
      ? `Restaurants of type "${type}"`
      : chain
        ? `Restaurants from "${chain}"`
        : "All Restaurants";

  return (
    <div className="food-search-page">
      <h2 className="food-search-title">{searchLabel}</h2>
      {price && <p className="food-search-subtitle">Starting at ₹{price}</p>}

      {loading ? (
        <p className="food-search-loading">Loading restaurants...</p>
      ) : (
        <div className="food-search-list">
          {restaurants.length === 0 ? (
            <p className="food-search-noresult">
              {food
                ? `No restaurants found serving ${food}.`
                : type
                  ? `No restaurants of type "${type}".`
                  : chain
                    ? `No restaurants from "${chain}".`
                    : "No restaurants found."}
            </p>
          ) : (
            restaurants.map(rest => {
              const matchedDishes = [];
              if (food) {
                rest.menu?.forEach(category => {
                  category.items?.forEach(dish => {
                    if (dish?.name?.toLowerCase().includes(food?.toLowerCase())) {
                      matchedDishes.push(dish);
                    }
                  });
                });
              }
              return (
                <div
                  key={rest._id}
                  className="food-search-card"
                  onClick={() => handleCardClick(rest._id)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={rest.image}
                    alt={rest.name}
                    className="food-search-image"
                  />
                  <div className="food-search-info">
                    <h3>{rest.name}</h3>
                    <p>{rest.cuisine?.join(", ")}</p>
                    <p>{rest.rating} ⭐</p>
                    {food &&
                      matchedDishes.map(dish => (
                        <p key={dish.name}>
                          <strong>{dish.name}</strong> – ₹{dish.price}
                        </p>
                      ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AllRestaurantsByFood;