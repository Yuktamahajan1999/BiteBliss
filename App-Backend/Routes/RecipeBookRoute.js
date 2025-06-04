import express from 'express';
import {
  getRecipeOfTheDay,
  getAllRecipes,
  getRecipeById,
  addRecipe,
  updateRecipe,
  deleteRecipe
} from '../Controllers/RecipeBookController.js';

import checkLogin from '../Middlewares/CheckLogin.js';
import { uploadMedia } from '../Middlewares/UploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/getrecipeofday', getRecipeOfTheDay);          
router.get('/', getAllRecipes);               
router.get('/getrecipe', getRecipeById);       

// Protected routes 
router.post('/addrecipe',uploadMedia.array('media', 5),  checkLogin, addRecipe);
router.put('/updaterecipe',uploadMedia.array('media',5), checkLogin, updateRecipe);
router.delete('/deleterecipe', checkLogin, deleteRecipe);

export default router;
