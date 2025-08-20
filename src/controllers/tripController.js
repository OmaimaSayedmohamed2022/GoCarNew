import Trip from "../models/tripModel.js";
import Client from "../models/clientModel.js";
import Driver from "../models/driverModel.js";
import Notification from "../models/notificationModel.js";
import logger from "../utils/logger.js";
import { generateCode } from "../utils/generateCode.js";
import { calculateDistance, calculatePrice } from "../utils/calculatePrice.js";


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


// ✅ Accept Trip (Driver) + Notify Both
export const acceptTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const trip = await Trip.findById(id);
    if (!trip || trip.status !== "Requested") {
      return res.status(400).json({ success: false, message: "Trip not available" });
    }

    trip.driverId = driverId;
    trip.status = "Accepted";
    await trip.save();

    await Driver.findByIdAndUpdate(driverId, { $push: { trips: trip._id } });

    // 🔔 Notify client
    await Notification.create({
      userId: trip.client,
      userType: "Client", 
      title: "Trip Accepted",
      message: `Your trip ${trip.tripCode} has been accepted by a driver.`,
      type: "trip",
    });

    // 🔔 Notify driver
    await Notification.create({
      userId: driverId,
      userType: "Driver", 
      title: "Trip Assigned",
      message: `You have accepted trip ${trip.tripCode}.`,
      type: "trip",
    });

    res.status(200).json({ success: true, message: "Trip accepted", trip });
  } catch (error) {
    console.error("Error accepting trip:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// ✅ Cancel Trip + Notify Client & Driver
export const cancelTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    trip.status = "Cancelled";
    await trip.save();

    // 🔔 Notify client
    await Notification.create({
      userId: trip.client,
      userType: "Client", 
      title: "Trip Cancelled",
      message: `Your trip ${trip.tripCode} has been cancelled.`,
      type: "trip",
    });

    // 🔔 Notify driver if assigned
    if (trip.driverId) {
      await Notification.create({
        userId: trip.driverId,
        userType: "Driver", 
        title: "Trip Cancelled",
        message: `Trip ${trip.tripCode} has been cancelled by the client.`,
        type: "trip",
      });
    }

    res.status(200).json({ success: true, message: "Trip cancelled", trip });
  } catch (error) {
    console.error("Error cancelling trip:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Complete Trip + Notify Client & Driver
export const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    trip.status = "Completed";
    trip.paymentInfo.status = "Paid";
    await trip.save();

    // 🔔 Notify client
    await Notification.create({
      userId: trip.client,
      userType: "Client", 
      title: "Trip Completed",
      message: `Your trip ${trip.tripCode} has been completed successfully.`,
      type: "trip",
    });

    // 🔔 Notify driver
    if (trip.driverId) {
      await Notification.create({
        userId: trip.driverId,
        userType: "Driver", 
        title: "Trip Completed",
        message: `You have completed trip ${trip.tripCode}.`,
        type: "trip",
      });
    }

    res.status(200).json({ success: true, message: "Trip completed", trip });
  } catch (error) {
    console.error("Error completing trip:", error);
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
