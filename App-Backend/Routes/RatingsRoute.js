import express from 'express';
import { createRating, getRatings, updateRating, deleteRating } from '../Controllers/RatingController.js';

const Ratingrouter = express.Router();

Ratingrouter.post('/', createRating);
Ratingrouter.get('/getRating', getRatings);
Ratingrouter.put('/uapdaterating', updateRating);
Ratingrouter.delete('/deleterating', deleteRating);

export default Ratingrouter;