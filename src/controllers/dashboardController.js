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
    const topDrivers = await Trip.aggregate([
      {
        $group: {
          _id: "$driverId",            
          totalEarnings: { $sum: "$price" }, 
          tripCount: { $sum: 1 }       
        }
      },

      { $sort: { totalEarnings: -1 } }, 
      { $limit: 6 },                    
      {
        $lookup: {                      
          from: "drivers",               
          localField: "_id",
          foreignField: "_id",
          as: "driver"
        }
      },
      { $unwind: "$driver" },        
      {
        $project: {
          _id: 0,
          driverId: "$driver._id",
          driverName: "$driver.name",
          totalEarnings: 1,
          tripCount: 1
        }
      }
    ]);

    res.json({ success: true, topDrivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const filterByCarType = async (req, res) => {
  try {
    const { carType } = req.query;

    const matchStage = carType ? { carType } : {};

    const result = await Trip.aggregate([
      {
        $lookup: {
          from: "drivers", // اتأكد من اسم الكوليكشن بالظبط
          localField: "driverId",
          foreignField: "_id",
          as: "driver",
        },
      },
      { $unwind: "$driver" },
      { $match: matchStage },
      {
        $group: {
          _id: "$driver._id",
          name: { $first: "$driver.fullName" },
          carType: { $first: "$carType" },
          totalEarnings: { $sum: "$price" },
          totalTrips: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



