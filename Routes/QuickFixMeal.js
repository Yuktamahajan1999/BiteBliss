import express from "express";
import {
  searchQuickFixMeals,
  createQuickFixMeal,
  getQuickFixMealById,
} from "../Controllers/QuickFixmeal.js";

const QuickFixMealsRouter = express.Router();

QuickFixMealsRouter.get("/searchquickfixmeal", searchQuickFixMeals);
QuickFixMealsRouter.post("/",createQuickFixMeal);
QuickFixMealsRouter.get("/getquickfixmeal",getQuickFixMealById);

export default QuickFixMealsRouter;