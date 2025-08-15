import express from "express";
import {
  // requestTrip,
  getNewTrips,
  acceptTrip,
  rejectTrip,
  inLocation,
  startTrip,
  endTrip,
  cancelTrip,
  getAllTrips,
  getNormalTrips,
  getScheduledTrips,
  getScheduledTripsToday,
  getScheduledTripsTomorrow,
  getScheduledTripsAfterTomorrow,
  getTripById,
  updateTrip,
  deleteTrip,
  // ratePassenger
} from "../controllers/drivertripController.js"

const router = express.Router();

// router.post("/request", requestTrip);

router.get("/newTrips", getNewTrips);

router.patch("/accept/:id", acceptTrip);

router.patch("/reject/:id", rejectTrip);

router.patch("/arrived/:id", inLocation);

router.patch("/start/:id", startTrip);

router.patch("/end/:id", endTrip);

router.patch("/cancel/:id", cancelTrip);

router.get("/allTrips", getAllTrips);

router.get("/normal", getNormalTrips);

router.get("/scheduled", getScheduledTrips);

router.get("/scheduled/today", getScheduledTripsToday);

router.get("/scheduled/tomorrow", getScheduledTripsTomorrow);

router.get("/scheduled/afterTomorrow", getScheduledTripsAfterTomorrow);

router.get("/getTrip/:id", getTripById);

router.patch("/update/:id", updateTrip);

router.delete("/delete/:id", deleteTrip);

// router.patch("/ratePassenger/:id", ratePassenger);

export default router;
