import DriverShift from "../models/driverShiftModel.js";
import logger from "../utils/logger.js";
import Driver from "../models/driverModel.js"
import config from "../utils/config.js";

// start Shift
export const startShift = async (req, res) => {
  try {
    const { driver, carType } = req.body;

    if (!driver || !carType) {
      return res.status(400).json({ success: false, message: "Driver and carType are required" });
    }

    const driverExists = await Driver.findById(driver);

    const activeShift = await DriverShift.findOne({ driver, endTime: null });
    if (activeShift) {
      return res.status(400).json({ success: false, message: "Driver already has an active shift." });
    }

    const shift = new DriverShift({
      driver,
      carType,
      startTime: new Date(),
    });

    driverExists.status = "online";
    await driverExists.save();
    await shift.save();

    res.status(201).json({ success: true, message: "Shift started", data: shift });
  } catch (error) {
    logger.error(`Error starting DriverShift: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// end shift
export const endShift = async (req, res) => {
  try {
    const { id } = req.params; 
    const shift = await DriverShift.findById(id);

    if (shift.endTime) {
      return res.status(400).json({ success: false, message: "Shift already ended!" });
    }

    shift.endTime = new Date();
    shift.status = "ended";
    await shift.save();

    const driver = await Driver.findById(shift.driver);
    if (driver) {
      driver.status = "offline";
      await driver.save();
    }

    res.status(200).json({ success: true, message: "Shift ended", data: shift });
  } catch (error) {
    logger.error(`Error ending DriverShift: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// get all
export const getAllShifts = async (req, res) => {
  try {
    const shifts = await DriverShift.find().populate("trips");
    res.status(200).json({ success: true, data: shifts });
  } catch (error) {
    logger.error(`Error getting all DriverShifts: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};


// get by id
export const getShiftById = async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await DriverShift.findById(id).populate("trips");

    res.status(200).json({ success: true, data: shift });
  } catch (error) {
    logger.error(`Error getting DriverShift by ID: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// update
export const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const updatedShift = await DriverShift.findByIdAndUpdate(id, updateData, { new: true });
  
    res.status(200).json({ success: true, message: "DriverShift updated successfully", data: updatedShift });
  } catch (error) {
    logger.error(`Error updating DriverShift: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete
export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    await DriverShift.findByIdAndDelete(id); 

    res.status(200).json({ success: true, message: "DriverShift deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting DriverShift: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
