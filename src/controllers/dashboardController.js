// routes/dashboard.js
import express from "express";
import Trip from "../models/tripModel.js";
import Driver from "../models/driverModel.js";
import Client from "../models/clientModel.js";



export const summary = async (req, res) => {
  try {
    const totalEarnings = await Trip.aggregate([
      { $group: { _id: null, total: { $sum: "$fare" } } },
    ]);

    const totalRides = await Trip.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalPassengers = await Client.countDocuments();

    const onlineDrivers = await Driver.countDocuments({ status: "online" });
    const offlineDrivers = await Driver.countDocuments({ status: "offline" });

    res.json({
      success: true,
      data: {
        totalEarnings: totalEarnings[0]?.total || 0,
        totalRides,
        totalDrivers,
        totalPassengers,
        onlineDrivers,
        offlineDrivers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

