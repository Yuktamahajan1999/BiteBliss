import express from "express";
import {
  getAllRewards, 
  redeemReward,    
  removeReward,     
  getUserPoints,
  addOrderPoints,    
} from "../Controllers/RewardController.js";

import checkLogin from "../Middlewares/CheckLogin.js";
import checkRole from "../Middlewares/CheckRole.js";

const Rewardrouter = express.Router();

// Get all rewards
Rewardrouter.get("/", checkLogin, getAllRewards);

// Redeem a reward
Rewardrouter.post("/redeemedReward", checkLogin, checkRole(['user']), redeemReward);

// Remove a redeemed reward for a user
Rewardrouter.delete("/removeReward", checkLogin, checkRole(['user']), removeReward);

// Get user points
Rewardrouter.get("/userpoints", checkLogin, getUserPoints);

// Add Order points
Rewardrouter.post("/addOrderPoints", checkLogin, checkRole(['user']), addOrderPoints);

export default Rewardrouter;