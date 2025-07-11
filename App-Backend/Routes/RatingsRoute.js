import express from 'express';
import { createRating, getRatings, updateRating, deleteRating } from '../Controllers/RatingController.js';
import checkLogin from '../Middlewares/CheckLogin.js';

const Ratingrouter = express.Router();

Ratingrouter.post('/', checkLogin,createRating);
Ratingrouter.get('/getRating',checkLogin, getRatings);
Ratingrouter.put('/uapdaterating', updateRating);
Ratingrouter.delete('/deleterating', deleteRating);

export default Ratingrouter;