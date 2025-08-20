import express from "express";

import { summary,rideStatus ,recentEarnings, 
     topDriversByEarning,approveDriver,rejectDriver,getAllNewDrivers,
     filterByCarType,getDrivers



} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", summary);
router.get("/ride/Status",rideStatus)
router.get("/recentEarnings",recentEarnings)
router.get("/topDrivers",topDriversByEarning)
router.get("/carFilter",getDrivers)
router.put("/approve/:id",approveDriver)
router.put("/reject/:id",rejectDriver)
router.get("/newDrivers",getAllNewDrivers)




export default router;
