import express from 'express';
import { searchDishes, createDish, getDishById } from '../Controllers/FamousDishController.js';

const Dishrouter = express.Router();

Dishrouter.get('/searchdish', searchDishes);
Dishrouter.post('/', createDish);
Dishrouter.get('/getdish', getDishById);

export default Dishrouter;