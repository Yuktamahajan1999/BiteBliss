import express from 'express';
import {
  getRecipeOfTheDay,
  getAllRecipes,
  getRecipeById,
  addRecipe,
  updateRecipe,
  deleteRecipe,
} from '../Controllers/RecipeBookController.js';

import checkLogin from '../Middlewares/CheckLogin.js';
import { uploadMedia } from '../Middlewares/UploadMiddleware.js';

const Reciperouter = express.Router();

// Get today's recipe
Reciperouter.get('/getrecipeofday', getRecipeOfTheDay);

// Get all recipes
Reciperouter.get('/', getAllRecipes);

// Get a specific recipe
Reciperouter.get('/getrecipe', getRecipeById);

// Add a recipe
Reciperouter.post('/addrecipe', uploadMedia.array('media', 5), checkLogin, addRecipe);

// Update a recipe
Reciperouter.put('/updaterecipe', uploadMedia.array('media', 5), checkLogin, updateRecipe);

// Delete a recipe
Reciperouter.delete('/deleterecipe', checkLogin, deleteRecipe);



export default Reciperouter;
