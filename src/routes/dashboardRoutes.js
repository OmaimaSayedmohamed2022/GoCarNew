import express from "express";
import { summary,rideStatus ,recentEarnings,
     topDriversByEarning,filterByCarType

} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", summary);
router.get("/ride/Status",rideStatus)
router.get("/recentEarnings",recentEarnings)
router.get("/topDrivers",topDriversByEarning)
router.get("/carFilter",filterByCarType)



export default router;
