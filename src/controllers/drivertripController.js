import Trip from "../models/tripModel.js";



export const acceptTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "accepted", driver: req.body.driverId },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const inLocation = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "arrived" },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const startTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "ongoing", startTime: new Date() },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
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

// Get all trips (for admin or driver maybe)
export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("driver")
      .populate("client")
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trips", error: error.message });
  }
};

// Get all normal (non-emergency) trips for driver
export const getNormalTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ type: "normal" })  // assuming type: 'normal' vs 'emergency'
      .populate("client")
      .populate("driver")
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching normal trips", error: error.message });
  }
};
// Get all scheduled trips for the driver
export const getScheduledTrips = async (req, res) => {
  try {
    const driverId = req.user.id;

    const trips = await Trip.find({ driver: driverId, status: "scheduled" })
      .populate("client")
      .populate("driver")
      .sort({ date: 1 }); 

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scheduled trips", error: error.message });
  }
};

// Get scheduled trips for the driver after tomorrow
export const getScheduledTripsAfterTomorrow = async (req, res) => {
  try {
    const driverId = req.user.id;

    const today = new Date();
    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(today.getDate() + 2); // بعد بكره

    const trips = await Trip.find({
      driver: driverId,
      status: "scheduled",
      date: { $gte: afterTomorrow },
    })
      .populate("client")
      .populate("driver")
      .sort({ date: 1 });

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scheduled trips after tomorrow", error: error.message });
  }
};
// Get scheduled trips for the driver today
export const getScheduledTripsToday = async (req, res) => {
  try {
    const driverId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const trips = await Trip.find({
      driver: driverId,
      status: "scheduled",
      date: { $gte: today, $lt: tomorrow },
    })
      .populate("client")
      .populate("driver")
      .sort({ date: 1 });

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching today's scheduled trips", error: error.message });
  }
};


// Get scheduled trips for the driver for tomorrow
export const getScheduledTripsTomorrow = async (req, res) => {
  try {
    const driverId = req.user.id;

    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
    dayAfterTomorrow.setHours(0, 0, 0, 0);

    const trips = await Trip.find({
      driver: driverId,
      status: "scheduled",
      date: { $gte: tomorrow, $lt: dayAfterTomorrow },
    })
      .populate("client")
      .populate("driver")
      .sort({ date: 1 });

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tomorrow's scheduled trips", error: error.message });
  }
};

// Get trip by ID
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, driver: req.user.id })
      .populate("client")
      .populate("driver");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip', error: error.message });
  }
};

// Update trip by ID
export const updateTrip = async (req, res) => {
  try {
    const { status, type, date, time } = req.body;

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, driver: req.user.id },
      {
        ...(status && { status }),
        ...(type && { type }),
        ...(date && { date }),
        ...(time && { time }),
      },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found or you are not authorized" });
    }

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Error updating trip', error: error.message });
  }
};


export const endTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: "completed", endTime: new Date() },
      { new: true }
    );
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getNewTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ driver: null, status: "pending" }).sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const ratePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const { passengerRating } = req.body;
    const trip = await Trip.findByIdAndUpdate(id, { passengerRating }, { new: true });
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
