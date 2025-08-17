import express from "express";
import { summary,rideStatus ,recentEarnings} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", summary);
router.get("/ride/Status",rideStatus)
// router.get



export default router;
