import Trip from "../models/tripModel.js";
import Client from "../models/clientModel.js";
import Driver from "../models/driverModel.js";
import Notification from "../models/notificationModel.js";
import logger from "../utils/logger.js";
import { generateCode } from "../utils/generateCode.js";
import { calculateDistance, calculatePrice } from "../utils/calculatePrice.js";
import { pushNotification } from "../utils/sendNotifications.js";


// ✅ Create Trip + Notify Client
export const createTrip = async (req, res) => {
  try {
    const {
      userId,
      carType,
      passengerNo,
      luggageNo,
      currentLocation,
      destination,
      scheduledAt,
      paymentMethod,
    } = req.body;

    const now = new Date();
    const isScheduled = scheduledAt && new Date(scheduledAt) > now;
    const status = isScheduled ? "Scheduled" : "Requested";

    const tripCode = generateCode();

    const distanceKm = calculateDistance(
      {
        lat: currentLocation.coordinates[1],
        lng: currentLocation.coordinates[0],
      },
      {
        lat: destination.coordinates[1],
        lng: destination.coordinates[0],
      }
    );
    const price = calculatePrice(carType, distanceKm);

    const trip = await Trip.create({
      client: userId,
      carType,
      passengerNo,
      luggageNo,
      currentLocation,
      destination,
      scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      paymentMethod,
      status,
      tripCode,
      distance: distanceKm.toFixed(2),
      price: price.toFixed(2),
    });

    // 🔔 Notify client
    await Notification.create({
      userId,
      title: "Trip Created",
      message: `Your trip ${tripCode} has been ${status.toLowerCase()}.`,
      type: "trip",
    });

    res.status(201).json({
      success: true,
      message: "Trip requested successfully",
      price,
      distanceKm,
      trip,
    });
  } catch (error) {
    logger.error("Error creating trip:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


// Accept trip
export const acceptTrip = async (req, res) => {
  try {
    const { id } = req.params;        // tripId expected
    const { driverId } = req.body;

    console.log("acceptTrip called", { tripId: id, driverId });

    const trip = await Trip.findById(id);
    if (!trip || trip.status !== "Requested") {
      return res.status(400).json({ success: false, message: "Trip not available" });
    }

    trip.driverId = driverId;
    trip.status = "Accepted";
    await trip.save();

    await Driver.findByIdAndUpdate(driverId, { $push: { trips: trip._id } });

    // notifications (use helper)
    await pushNotification(trip.client, "Client", "Trip Accepted", `Your trip ${trip.tripCode} has been accepted by a driver.`, "trip");
    await pushNotification(driverId, "Driver", "Trip Assigned", `You accepted trip ${trip.tripCode}.`, "trip");

    console.log("acceptTrip completed notifications pushed", { tripId: id });
    res.status(200).json({ success: true, message: "Trip accepted", trip });
  } catch (error) {
    logger.error("Error accepting trip:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel trip
export const cancelTrip = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("cancelTrip called", { tripId: id });
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    // optionally capture who cancels (req.user?) to send appropriate message
    trip.status = "Cancelled";
    await trip.save();

    await pushNotification(trip.client, "Client", "Trip Cancelled", `Your trip ${trip.tripCode} has been cancelled.`, "trip");

    if (trip.driverId) {
      await pushNotification(trip.driverId, "Driver", "Trip Cancelled", `Trip ${trip.tripCode} has been cancelled.`, "trip");
    }

    console.log("cancelTrip notifications done", { tripId: id });
    res.status(200).json({ success: true, message: "Trip cancelled", trip });
  } catch (error) {
    logger.error("Error cancelling trip:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start trip (driver starts trip) - make sure route and status checks exist
export const startTrip = async (req, res) => {
  try {
    const { id } = req.params; // tripId
    const { driverId } = req.body;
    console.log("startTrip called", { tripId: id, driverId });

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
    if (trip.driverId?.toString() !== driverId) {
      return res.status(403).json({ success: false, message: "Not authorized to start this trip" });
    }

    trip.status = "Ongoing";
    await trip.save();

    await pushNotification(trip.client, "Client", "Trip Started", `Your trip ${trip.tripCode} has started.`, "trip");
    await pushNotification(driverId, "Driver", "Trip In Progress", `You started trip ${trip.tripCode}.`, "trip");

    console.log("startTrip notifications done", { tripId: id });
    res.status(200).json({ success: true, message: "Trip started", trip });
  } catch (error) {
    logger.error("Error starting trip:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete trip
export const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("completeTrip called", { tripId: id });

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    trip.status = "Completed";
    if (!trip.paymentInfo) trip.paymentInfo = {};
    trip.paymentInfo.status = "Paid";
    await trip.save();

    await pushNotification(trip.client, "Client", "Trip Completed", `Your trip ${trip.tripCode} has been completed.`, "trip");
    if (trip.driverId) {
      await pushNotification(trip.driverId, "Driver", "Trip Completed", `You completed trip ${trip.tripCode}.`, "trip");
    }

    console.log("completeTrip notifications done", { tripId: id });
    res.status(200).json({ success: true, message: "Trip completed", trip });
  } catch (error) {
    logger.error("Error completing trip:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my trips
export const getMyTrips = async (req, res) => {
  try {
    const { userId, status } = req.query;

    let filter = {
      $or: [
        { driverId: userId },
        { client: userId }
      ]
    };

    if (status) {
      filter.status = status.charAt(0).toUpperCase() + status.slice(1);
    }

    const trips = await Trip.find(filter);

    res.json({
      success: true,
      trips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Rate Trip
export const rateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    trip.rating = rating;
    trip.review = review;
    await trip.save();

    res.status(200).json({ message: 'Trip rated successfully', trip });
  } catch (error) {
    res.status(500).json({ message: 'Error rating trip', error: error.message });
  }
};
