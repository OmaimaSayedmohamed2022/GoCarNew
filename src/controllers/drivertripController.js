import Trip from "../models/tripModel.js";

import moment from "moment"
// Accept Trip
export const acceptTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "Accepted", driverId: req.body.driverId },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject Trip
export const rejectTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Driver Arrived
export const inLocation = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "Arrived" },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start Trip
export const startTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "Ongoing", startTime: new Date() },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel Trip
export const cancelTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    trip.status = "Cancelled";
    await trip.save();
    res.status(200).json({ message: "Trip cancelled successfully", trip });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Trip
export const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findByIdAndDelete(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Trips
export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("driverId")
      .populate("client")
      .sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trips", error: error.message });
  }
};

// Get Normal Trips
export const getNormalTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ rideType: "normal" })
      .populate("client")
      .populate("driverId")
      .sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching normal trips", error: error.message });
  }
};

// Get Scheduled Trips
export const getScheduledTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ driverId: req.user.id, status: "Scheduled" })
      .populate("client")
      .populate("driverId")
      .sort({ scheduledAt: 1 });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scheduled trips", error: error.message });
  }
};

// Get Trip by ID
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, driverId: req.user.id })
      .populate("client")
      .populate("driverId");
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trip", error: error.message });
  }
};

// Update Trip
export const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, driverId: req.user.id },
      req.body,
      { new: true }
    );
    if (!trip) {
      return res.status(404).json({ message: "Trip not found or not authorized" });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: "Error updating trip", error: error.message });
  }
};

// End Trip
export const endTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "Completed", endTime: new Date() },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rate Trip (Client)
export const rateTrip = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { rating, review },
      { new: true }
    );
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: "Error rating trip", error: error.message });
  }
};


// Get Scheduled Trips After Tomorrow
export const getScheduledTripsAfterTomorrow = async (req, res) => {
  try {
    const { driverId } = req.params;
    const dayAfterTomorrow = moment().add(2, "days").startOf("day");
    const trips = await Trip.find({
      driver: driverId,
      status: "Scheduled",
      date: { $gte: dayAfterTomorrow.toDate() }
    }).populate("passenger driver");
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Scheduled Trips Today
export const getScheduledTripsToday = async (req, res) => {
  try {
    const { driverId } = req.params;
    const startOfDay = moment().startOf("day");
    const endOfDay = moment().endOf("day");

    const trips = await Trip.find({
      driver: driverId,
      status: "Scheduled",
      date: { $gte: startOfDay.toDate(), $lte: endOfDay.toDate() }
    }).populate("passenger driver");

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Scheduled Trips Tomorrow
export const getScheduledTripsTomorrow = async (req, res) => {
  try {
    const { driverId } = req.params;
    const startOfTomorrow = moment().add(1, "days").startOf("day");
    const endOfTomorrow = moment().add(1, "days").endOf("day");

    const trips = await Trip.find({
      driver: driverId,
      status: "Scheduled",
      date: { $gte: startOfTomorrow.toDate(), $lte: endOfTomorrow.toDate() }
    }).populate("passenger driver");

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get New Trips (Pending trips for a driver)
export const getNewTrips = async (req, res) => {
  try {
    const { driverId } = req.params;
    const trips = await Trip.find({
      driver: driverId,
      status: "Requested"
    }).populate("passenger driver");

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

