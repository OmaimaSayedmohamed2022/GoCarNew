// routes/dashboard.js
import express from "express";
import Trip from "../models/tripModel.js";
import Driver from "../models/driverModel.js";
import Client from "../models/clientModel.js";



export const summary = async (req, res) => {
  try {
    const totalEarnings = await Trip.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const totalRides = await Trip.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalPassengers = await Client.countDocuments();

    const onlineDrivers = await Driver.countDocuments({ status: "online" });
    const offlineDrivers = await Driver.countDocuments({ status: "offline" });

    
    const driverRatings = await Driver.aggregate([
      { $match: { rating: { $ne: null } } },
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
         total: driverRatings[0]?.totalRatings || 0,
        average: driverRatings[0]?.averageRating?.toFixed(2) || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const rideStatus=  async (req, res) => {
  try {
    const statusCounts = await Trip.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result = {
      success: statusCounts.find(s => s._id === "success")?.count || 0,
      failed: statusCounts.find(s => s._id === "failed")?.count || 0,
      scheduled: statusCounts.find(s => s._id === "scheduled")?.count || 0,
    };

    res.json({ success: true, status: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const recentEarnings = async (req, res) => {
  try {
    const earnings = await Trip.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("driverId", "name");

    const formatted = earnings.map(e => ({
      date: e.createdAt.toISOString().split("T")[0],
      driverName: e.driverId?.name,
      totalFare: e.price,        
      hisMoney: e.companyShare,  
    }));

    res.json({ success: true, earnings: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const topDriversByEarning = async (req, res) => {
  try {
    const { carType } = req.query;

    // Base match (if carType is sent, filter by it)
    const matchStage = {};
    if (carType && carType !== "All") {
      matchStage.carType = carType;
    }

    // Aggregation pipeline
    const topDrivers = await Driver.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$driverId",
          driverName: { $first: "$driverName" },
          carType: { $first: "$carType" },
          totalTrips: { $sum: 1 },
          totalEarnings: { $sum: "$fare" },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { totalEarnings: -1 } }, // sort by earnings
      { $limit: 10 }, // top 10 drivers
    ]);

    res.json({ success: true, data: topDrivers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const getDrivers = async (req, res) => {
  try {
    const { carType } = req.query; 

    let filter = {};
    if (carType && carType !== "All") {
      filter.carType = carType;
    }

    const drivers = await Driver.find(filter).select("name carType status");

    res.json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

