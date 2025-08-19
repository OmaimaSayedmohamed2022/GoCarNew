// routes/dashboard.js
import express from "express";
import Trip from "../models/tripModel.js";
import Driver from "../models/driverModel.js";
import Client from "../models/clientModel.js";



// Summary API
export const summary = async (req, res) => {
  try {
    const totalEarnings = await Trip.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const totalRides = await Trip.countDocuments();
    const totalDrivers = await Driver.countDocuments({ isApproved: "approved" }); // approved only
    const totalPassengers = await Client.countDocuments();

    const onlineDrivers = await Driver.countDocuments({ status: "online", isApproved: "approved" });
    const offlineDrivers = await Driver.countDocuments({ status: "offline", isApproved: "approved" });

    const ratings = await Trip.aggregate([
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalEarnings: totalEarnings[0]?.total || 0,
        totalRides,
        totalDrivers,
        totalPassengers,
        onlineDrivers,
        offlineDrivers,
        totalRatings: ratings[0]?.totalRatings || 0,
        averageRating: ratings[0]?.averageRating?.toFixed(2) || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ride Status API
export const rideStatus = async (req, res) => {
  try {
    const statusCounts = await Trip.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result = {
      success: statusCounts.find((s) => s._id === "success")?.count || 0,
      failed: statusCounts.find((s) => s._id === "failed")?.count || 0,
      scheduled: statusCounts.find((s) => s._id === "scheduled")?.count || 0,
    };

    res.json({ success: true, status: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Recent Earnings API
export const recentEarnings = async (req, res) => {
  try {
    const earnings = await Trip.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "driverId",
        select: "fullName",
        match: { isApproved: "approved" }, // approved only
      });

    const formatted = earnings
      .filter((e) => e.driverId) // remove trips with unapproved drivers
      .map((e) => ({
        date: e.createdAt.toISOString().split("T")[0],
        driverName: e.driverId?.fullName,
        totalFare: e.price,
        hisMoney: e.companyShare,
      }));

    res.json({ success: true, earnings: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Top 6 Drivers by Earnings API
export const topDriversByEarning = async (req, res) => {
  try {
    const topDrivers = await Trip.aggregate([
      {
        $group: {
          _id: "$driverId",
          totalEarnings: { $sum: "$price" },
          tripCount: { $sum: 1 },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "drivers",
          localField: "_id",
          foreignField: "_id",
          as: "driver",
        },
      },
      { $unwind: "$driver" },
      { $match: { "driver.isApproved": "approved" } }, // approved only
      {
        $project: {
          _id: 0,
          driverId: "$driver._id",
          driverName: "$driver.fullName",
          totalEarnings: 1,
          tripCount: 1,
        },
      },
    ]);

    res.json({ success: true, topDrivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Drivers with carType filter API
export const getDrivers = async (req, res) => {
  try {
    const { carType } = req.query;

    let filter = { isApproved: "approved" }; 
    if (carType && carType !== "All") {
      filter.carType = carType;
    }

    const drivers = await Driver.find(filter).select("fullName carType status");

    res.json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// new drivers (pending)
export const getAllNewDrivers = async (req, res) => {
  try {
    const newDrivers = await Driver.find(
      { isApproved: "pending" },  
      { password: 0, __v: 0 }
    );

    res.status(200).json({
      success: true,
      count: newDrivers.length,
      data: newDrivers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// approve driver 
export const approveDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findByIdAndUpdate(
      id,
      { isApproved: "approved" },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    res.json({
      success: true,
      message: "Driver approved successfully",
      data: driver,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// reject driver
export const rejectDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findByIdAndUpdate(
      id,
      { isApproved: "rejected" },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    res.json({
      success: true,
      message: "Driver rejected successfully",
      data: driver,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


