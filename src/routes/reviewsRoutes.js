import express from "express";
import { getReviews, addReview ,getDriverReviews} from  "../controllers/reviewsController.js"
import { verifyToken } from "../middlewares/authMiddleware.js"

const router = express.Router();

router.get("/reviews/:clientId", getReviews);
router.get("/reviews/:driverId", getDriverReviews);

router.post("/add/:clientId", verifyToken, addReview);


export default router;
