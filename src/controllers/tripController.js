
import Trip from "../models/tripModel.js";
import Client from "../models/clientModel.js";
import DriverShift from "../models/driverShiftModel.js";
import Driver from "../models/driverModel.js";
import logger from "../utils/logger.js";
import { generateCode } from '../utils/generateCode.js';

// Request a trip (client side, to be accepted by driver later)
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
      rideType,
      price,
      driverShift, // optional for scheduled
      notes
    } = req.body;

    const now = new Date();
    const isScheduled = scheduledAt && new Date(scheduledAt) > now;
    const status = isScheduled ? "Scheduled" : "Requested";

    const tripCode = generateCode();

    const trip = await Trip.create({
      client: userId,
      carType,
      passengerNo,
      luggageNo,
      currentLocation,
      destination,
      scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      status,
      rideType,
      price,
      tripCode,
      notes,
      driverShift,
      paymentInfo: {
        method: paymentMethod || "Cash",
        status: "Pending"
      }
    });

    res.status(201).json({ success: true, message: "Trip requested successfully", trip });
  } catch (error) {
    logger.error("Error requesting trip:", error);
    res.status(500).json({ success: false, message: "Error requesting trip", error: error.message });
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

    if (trip.paymentInfo.method === "cash" && !driver.acceptCash) {
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

// Cancel trip (client or system)
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

// Complete trip (driver side)
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

// Get all trips for a client or driver
const getTrips = async (req, res) => {
  try {
    const { role, userId, status } = req.query;

    let filter = {};

    if (role === "driver") {
      filter.driverId = userId;
    } else if (role === "client") {
      filter.clientId = userId;
    }

    if (status) {
      filter.status = status.charAt(0).toUpperCase() + status.slice(1); // Capitalize
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




// Update trip status manually (admin or internal use)
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
