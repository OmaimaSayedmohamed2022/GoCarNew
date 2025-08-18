import express from "express";
import { getReviews, addReview } from  "../controllers/reviewsController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"

const router = express.Router();

router.get("/reviews/:clientId", getReviews);

router.post("/add/:clientId", verifyToken, addReview);


export default router;
