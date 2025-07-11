import mongoose from 'mongoose';
import RecipeBook from '../Models/RecipeBook.js';
import { uploadToCloudinary, uploadFromUrlToCloudinary } from '../Middlewares/UploadMiddleware.js';

// Add a new recipe
export const addRecipe = async (req, res) => {
  try {
    const { title, description, prepTime, ingredients, steps, existingMedia, mediaLinks } = req.body;
    const mediaFiles = req.files || [];

    if (!title || !description || !ingredients || !steps) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const ingredientsArr = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const stepsArr = typeof steps === "string" ? JSON.parse(steps) : steps;
    const existingMediaArr = existingMedia ? JSON.parse(existingMedia) : [];
    const mediaLinksArr = mediaLinks ? JSON.parse(mediaLinks) : [];

    const uploadedMedia = [];

    for (const file of mediaFiles) {
      const result = await uploadToCloudinary(file.buffer, "recipes");
      uploadedMedia.push({
        url: result.secure_url,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
        name: file.originalname,
        isFile: true,
      });
    }

    for (const link of mediaLinksArr) {
      try {
        const result = await uploadFromUrlToCloudinary(link, "recipes");
        uploadedMedia.push({
          url: result.secure_url,
          type: result.resource_type === 'video' ? 'video' : 'image',
          name: link.split('/').pop(),
          isFile: false,
        });
      } catch (err) {
        console.warn(`Failed to upload media link: ${link}`, err.message);
      }
    }

    const allMedia = [...existingMediaArr, ...uploadedMedia];

    const newRecipe = new RecipeBook({
      title,
      description,
      prepTime: prepTime || '',
      ingredients: ingredientsArr,
      steps: stepsArr,
      media: allMedia,
      user: req.user.id,
    });

    await newRecipe.save();
    res.status(201).json({ message: 'Recipe added successfully!', recipe: newRecipe });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ message: 'Failed to add recipe, please try again later.' });
  }
};

// Update an existing recipe
export const updateRecipe = async (req, res) => {
  const { id } = req.query;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid or missing recipe ID.' });
  }

  try {
    const { title, description, prepTime, ingredients, steps, existingMedia, mediaLinks } = req.body;
    const mediaFiles = req.files || [];

    const ingredientsArr = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const stepsArr = typeof steps === "string" ? JSON.parse(steps) : steps;
    const existingMediaArr = existingMedia ? JSON.parse(existingMedia) : [];
    const mediaLinksArr = mediaLinks ? JSON.parse(mediaLinks) : [];

    const uploadedMedia = [];

    for (const file of mediaFiles) {
      const result = await uploadToCloudinary(file.buffer, "recipes");
      uploadedMedia.push({
        url: result.secure_url,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
        name: file.originalname,
        isFile: true,
      });
    }

    for (const link of mediaLinksArr) {
      uploadedMedia.push({
        url: link,
        type: link.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image',
        name: link.split('/').pop(),
        isFile: false,
      });
    }

    const allMedia = [...existingMediaArr, ...uploadedMedia];

    const updatedData = {
      title,
      description,
      prepTime,
      ingredients: ingredientsArr,
      steps: stepsArr,
      media: allMedia,
    };

    const updatedRecipe = await RecipeBook.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedRecipe) return res.status(404).json({ message: 'Recipe not found.' });

    res.status(200).json({ message: 'Recipe updated successfully!', recipe: updatedRecipe });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Failed to update recipe.' });
  }
};

// Get Recipe of the Day
export const getRecipeOfTheDay = async (req, res) => {
  try {
    const latestRecipe = await RecipeBook.findOne().sort({ createdAt: -1 });
    if (!latestRecipe) {
      return res.status(200).json({ message: "No recipe found for today.", recipe: null });
    }
    res.status(200).json({ message: "Here's today's recipe!", recipe: latestRecipe });
  } catch (err) {
    res.status(500).json({ message: "Couldn't fetch recipe.", error: err.message });
  }
};


// Get all recipes
export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await RecipeBook.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'All recipes loaded successfully.', recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Something went wrong while getting recipes.' });
  }
};

// Get a single recipe
export const getRecipeById = async (req, res) => {
  const { id } = req.query;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid or missing recipe ID, please check again.' });
  }

  try {
    const recipe = await RecipeBook.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found with this ID.' });

    res.status(200).json({ message: 'Recipe fetched successfully.', recipe });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Something went wrong while fetching the recipe.' });
  }
};

// Delete a recipe
export const deleteRecipe = async (req, res) => {
  const { id } = req.query;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid or missing recipe ID.' });
  }

  try {
    const recipe = await RecipeBook.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });

    await RecipeBook.findByIdAndDelete(id);
    res.status(200).json({ message: 'Recipe deleted successfully!' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Failed to delete recipe.' });
  }
};
