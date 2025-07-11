/* eslint-disable no-unused-vars */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipes } from '../data';

const RecipeDetail = () => {
  const { recipeName } = useParams();
  const navigate = useNavigate();

  const allRecipes = recipes.flatMap(category => 
    category.foods.map(food => ({ ...food, mood: category.mood }))
  );

  const recipe = allRecipes.find(
    food => food.name.toLowerCase().replace(/ /g, '-') === recipeName
  );

  if (!recipe) {
    return (
      <div className="recipe-detail">
        <h2>Recipe not found</h2>
        <button onClick={() => navigate('/suggestmood')} className="back-button">
          ← Back to Moods
        </button>
      </div>
    );
  }

  return (
    <div className="recipe-detail">
      <button onClick={() => navigate('/suggestmood')} className="back-button">
        ← Back to Moods
      </button>
      <h1 className="rd-title">{recipe.name}</h1>
      <div className="rd-meta">
        <p><strong>Type:</strong> {recipe.type}</p>
        <p><strong>Time:</strong> {recipe.time}</p>
        <p><strong>Mood:</strong> {recipe.mood}</p>
      </div>
      <p className="rd-description">{recipe.description}</p>

      <div className="rd-section">
        <h2>Ingredients</h2>
        <ul>
          {recipe.ingredients.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="rd-section">
        <h2>Instructions</h2>
        <ol>
          {recipe.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeDetail;