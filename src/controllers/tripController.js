import Trip from "../models/tripModel.js";
import Client from "../models/clientModel.js";
import DriverShift from "../models/driverShiftModel.js";
import Driver from "../models/driverModel.js";
import logger from "../utils/logger.js";
import { generateCode } from '../utils/generateCode.js';
import { calculateDistance, calculatePrice } from "../utils/calculatePrice.js";

// Create Trip
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

    // ✅ validate car type
    if (!carType || !["Economy", "Large", "VIP", "Pet"].includes(carType)) {
      return res.status(400).json({ success: false, message: "Invalid car type" });
    }

    // ✅ validate locations
    if (!currentLocation?.coordinates || !destination?.coordinates) {
      return res.status(400).json({ success: false, message: "Invalid location data" });
    }

    // convert from GeoJSON to lat/lng
    const loc1 = {
      lat: currentLocation.coordinates[1],
      lng: currentLocation.coordinates[0],
    };
    const loc2 = {
      lat: destination.coordinates[1],
      lng: destination.coordinates[0],
    };

    const now = new Date();
    const isScheduled = scheduledAt && new Date(scheduledAt) > now;
    const status = isScheduled ? "Scheduled" : "Requested";

    const tripCode = generateCode();

    // calculate distance
    const distanceKm = calculateDistance(loc1, loc2);
    if (isNaN(distanceKm)) {
      return res.status(400).json({ success: false, message: "Invalid distance calculation" });
    }

    // calculate price
    const price = calculatePrice(carType, distanceKm);
    if (isNaN(price)) {
      return res.status(400).json({ success: false, message: "Invalid price calculation" });
    }

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

    res.status(201).json({
      success: true,
      message: "Trip requested successfully",
      price,
      distanceKm,
      trip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error requesting trip",
      error: error.message,
    });
  }
};

// Accept trip (driver side)
export const acceptTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const trip = await Trip.findById(id);
    if (!trip || trip.status !== "Requested") {
      return res.status(400).json({ success: false, message: "Trip not available for acceptance" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    if (trip.paymentInfo?.method === "cash" && !driver.acceptCash) {
      return res.status(400).json({ message: "Driver does not accept cash payments" });
    }

    trip.driverId = driverId;
    trip.status = "Accepted";
    await trip.save();

    await Driver.findByIdAndUpdate(driverId, { $push: { trips: trip._id } });

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
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    if (["Completed", "Cancelled"].includes(trip.status)) {
      return res.status(400).json({ success: false, message: "Trip cannot be cancelled" });
    }

    trip.status = "Cancelled";
    await trip.save();

    res.status(200).json({ success: true, message: "Trip cancelled", trip });
  } catch (error) {
    logger.error("Error cancelling trip:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete trip
export const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    if (trip.status !== "Ongoing" && trip.status !== "Accepted") {
      return res.status(400).json({ success: false, message: "Trip is not in progress" });
    }

    trip.status = "Completed";
    trip.paymentInfo.status = "Paid";
    await trip.save();

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

// Update status (admin)
export const updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Requested", "Accepted", "Ongoing", "Cancelled", "Completed", "Scheduled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid trip status" });
    }

    const trip = await Trip.findByIdAndUpdate(id, { status }, { new: true });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    res.status(200).json({ success: true, message: "Trip status updated", trip });
  } catch (error) {
    logger.error("Error updating trip status:", error);
    res.status(500).json({ success: false, message: error.message });
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
