import express from "express";
import {
  getAllRewards,
  redeemReward,
  getUserRedeemedRewards,
  updateReward,
  deleteReward,
} from "../Controllers/RewardController.js";
import checkLogin from "../Middlewares/CheckLogin.js";
import checkRole from "../Middlewares/CheckRole.js";

const Rewardrouter = express.Router();

Rewardrouter.get("/", checkLogin, getAllRewards);

Rewardrouter.post("/redeemedReward", checkLogin, checkRole(['user']), redeemReward);

Rewardrouter.get("/redeemedById", checkLogin, checkRole(['user']), getUserRedeemedRewards);

Rewardrouter.put("/Updatereward", checkLogin, updateReward);

Rewardrouter.delete("/deleteReward", checkLogin, deleteReward);


export default Rewardrouter;