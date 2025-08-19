import bcrypt from "bcryptjs";
import uploadToCloudinary from "../middlewares/uploadToCloudinary.js";
import logger from "../utils/logger.js";
import Driver from "../models/driverModel.js"
import config from '../utils/config.js';
import { generateToken } from "../middlewares/authMiddleware.js";


// register
export const register = async (req, res) => {
    try {
        const { fullName, email, password, role, phoneNumber, companyNumber, invitationCode } = req.body;
        
        await Driver.findOne({ phoneNumber });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let licenseImage = "";
        if (req.file) {
            try {
                // console.log(req.file.originalname);
                licenseImage = await uploadToCloudinary(req.file.buffer);
                // console.log(licenseImageUrl);
            } catch (error) {
                return res.status(500).json({ success: false, message: "licenseImage upload failed" });
            }
        }

        const newDriver = new Driver({
            fullName,
            email,
            password: hashedPassword,
            role,
            phoneNumber, 
            licenseImage,
            companyNumber,
            invitationCode
        });
        
        const token = generateToken({ _id: newDriver._id, phoneNumber, role });

        await newDriver.save();
        res.status(201).json({ success: true, message: 'Driver registered successfully', data: newDriver, token });
    }
    catch (error) {
        logger.error(`Error registering Driver: ${error.message}`);
        res.status(500).json({ success: false, message: error.message})
    }
}

// get all drivers (approved only)
export const getAllDrivers = async (req, res) => {
  try {
    const Drivers = await Driver.find(
      { isApproved: "approved" },  // 
      { password: 0, __v: 0 }
    );
    res.status(200).json({ success: true, data: Drivers });
  } catch (error) {
    logger.error(`Error getting all Drivers: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get driver by id (only if approved)
export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findOne(
      { _id: id, isApproved: "approved" },
      { password: 0, __v: 0 }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found or not approved" });
    }

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    logger.error(`Error getting driver by ID: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// update
export const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;

        let updateData = { ...req.body };

        if (req.file) {
            try {
                const uploadedImage = await uploadToCloudinary(req.file.buffer);
                updateData.licenseImage = uploadedImage;
        } catch (error) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
        }
    }

        const updateDriver = await Driver.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({ success: true, message: 'Driver updated successfully', data: updateDriver });
    }
    catch (error) {
        logger.error(`Error updating Driver: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// delete
export const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;
        await Driver.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Driver deleted successfully' });
    }
    catch (error) {
        logger.error(`Error deleting Driver: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// update status (online)
export const updateStatusOnline = async (req, res) => {
    try {
        const { id } = req.params; 
        const updatedDriver = await Driver.findByIdAndUpdate( id, { status: "online" }, { new: true });

        res.status(200).json({ success: true, message: "Driver status updated to online", data: updatedDriver });
    } catch (error) {
        logger.error(`Error updating Driver status: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// update status (offline)
export const updateStatusOffline = async (req, res) => {
    try {
        const { id } = req.params; 
        const updatedDriver = await Driver.findByIdAndUpdate( id, { status: "offline" }, { new: true });

        res.status(200).json({ success: true, message: "Driver status updated to offline", data: updatedDriver });
    } catch (error) {
        logger.error(`Error updating Driver status: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};


// accept cash
export const acceptCash = async (req, res) => {
    try {
        const { id } = req.params; 
        const updatedDriver = await Driver.findByIdAndUpdate( id, { acceptCash: true }, { new: true });

        res.status(200).json({ success: true, message: "Now! Driver accepts cash", data: updatedDriver });
    } catch (error) {
        logger.error(`Error updating Driver: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// refuse cash
export const refuseCash = async (req, res) => {
    try {
        const { id } = req.params; 
        const updatedDriver = await Driver.findByIdAndUpdate( id, { acceptCash: false }, { new: true });

        res.status(200).json({ success: true, message: "Now! Driver refuses cash", data: updatedDriver });
    } catch (error) {
        logger.error(`Error updating Driver: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};