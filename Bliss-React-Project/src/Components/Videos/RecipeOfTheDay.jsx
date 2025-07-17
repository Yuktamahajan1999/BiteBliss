/* eslint-disable no-unused-vars */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

function RecipeOfTheDay() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const retrieveRecipeOfTheDay = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/recipebook/getrecipeofday`,
          {
            withCredentials: true,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (res.data.recipe) {
          setRecipe(res.data.recipe);
        } else {
          setError("No recipe available today");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("No recipe available today");
        } else {
          setError("Failed to load recipe. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    retrieveRecipeOfTheDay();
  }, []);

  if (loading) {
    return <div className="recipe-of-day-loading">⏳ Getting today&apos;s special ready...</div>;
  }

  if (error || !recipe) {
    return (
      <div className="recipe-of-day-no-recipe">
        <div className="recipe-of-day-no-recipe-placeholder">🍳</div>
        <p className="recipe-of-day-no-recipe-text">
          {error || "No recipe of the day available right now."} <br />
          Come back soon for something delicious! 🍲
        </p>
      </div>
    );
  }

  return (
    <div className="recipe-of-day-container">
      <div className="recipe-of-day-card">
        <h2 className="recipe-of-day-heading">🍽️ Recipe of the Day</h2>
        <h3 className="recipe-of-day-title">{recipe.title}</h3>

        {recipe.media?.length > 0 && (
          <div className={`recipe-of-day-media-gallery ${recipe.media.length === 1 ? 'single-media' : ''}`}>
            {recipe.media.map((media, index) => (
              <div key={index} className="recipe-of-day-media-item">
                {media.type === 'video' ? (
                  <video controls>
                    <source src={media.url} type={`video/${media.url.split('.').pop()}`} />
                  </video>
                ) : (
                  <img
                    src={media.url}
                    alt={`${recipe.title} - Media ${index + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f5f5f5'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle' fill='%23aaa'%3EImage not available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <p className="recipe-of-day-description">{recipe.description}</p>

        <div className="recipe-of-day-section">
          <h4>📝 Ingredients:</h4>
          <ul>
            {recipe.ingredients?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="recipe-of-day-section">
          <h4>👨‍🍳 Steps:</h4>
          <ol>
            {recipe.steps?.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default RecipeOfTheDay;
