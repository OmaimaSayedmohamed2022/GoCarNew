import express from "express";
import { getReviews, addReview } from  "../controllers/reviewsController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"

const router = express.Router();

router.get("/reviews", getReviews);
router.post("/add", verifyToken, addReview);

export default router;