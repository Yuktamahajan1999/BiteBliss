import express from "express";
import {
  hideRestaurant,
  unhideRestaurant,
  getHiddenRestaurants
} from "../Controllers/HiddenRestaurantController.js";
import checkLogin from "../Middlewares/CheckLogin.js";
import checkRole from "../Middlewares/CheckRole.js";

const HiddenRestaurantsrouter = express.Router();

// Hide the restauarant
HiddenRestaurantsrouter.post("/hide", checkLogin, checkRole(["user"]), hideRestaurant);

// Get Hidden Restaurants
HiddenRestaurantsrouter.get("/gethidden", checkLogin,checkRole(['user']), getHiddenRestaurants);

// Unhide the restaurant
HiddenRestaurantsrouter.delete("/unhide", checkLogin,checkRole(['user']), unhideRestaurant);

export default HiddenRestaurantsrouter;
