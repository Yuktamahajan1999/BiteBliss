import express from 'express';
import { searchMoods, createMood, getMoodById, getAllMoods } from '../Controllers/SuggestMoodController.js';

const SuggestMoodRouter = express.Router();

SuggestMoodRouter.get('/searchmoodfood', searchMoods);
SuggestMoodRouter.post('/', createMood);
SuggestMoodRouter.get('/getmoodfood', getMoodById);
SuggestMoodRouter.get('/getAllMoodFood',getAllMoods)

export default SuggestMoodRouter;