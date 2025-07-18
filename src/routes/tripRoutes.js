import express from 'express';
import {
  createTrip,
  // getTripById,
  getMyTrips,
  // updateTrip,
  // deleteTrip,
  cancelTrip,
  completeTrip,
  rateTrip
} from '../controllers/tripController.js';
import {
  createPaypalPayment,
  capturePaypalPayment
} from "../services/paypal.js";


const router = express.Router();

//trip
router.post('/', createTrip);
router.get('/', getMyTrips);
// router.get('/:id', getTripById);
// router.put('/:id', updateTrip);
// router.delete('/:id', deleteTrip);
router.patch("/:id/cancel", cancelTrip);
router.patch("/:id/complete", completeTrip);
router.patch("/:id/rate", rateTrip);

// payment
router.post("/create-paypal", createPaypalPayment);
router.post("/capture-paypal", capturePaypalPayment);

export default router;
