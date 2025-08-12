import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";
import Client from "../models/clientModel.js";
import Driver from "../models/driverModel.js";
import config from '../utils/config.js';
import { generateToken } from "../middlewares/authMiddleware.js";

export const register = async (req, res) => {
    try {
        const { fullName, email, password, role, phoneNumber, invitationCode } = req.body;
        
        await Client.findOne({ phoneNumber });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newClient = new Client({
            fullName,
            email, 
            password: hashedPassword,
            role,
            phoneNumber,
            invitationCode
        });

        const token = generateToken({ _id: newClient._id, phoneNumber, role });
        
        await newClient.save();
        res.status(201).json({ success: true, message: 'Client registered successfully', data: newClient, token });
    }
    catch (error) {
        logger.error(`Error registering Client: ${error.message}`);
        res.status(500).json({ success: false, message: error.message})
    }
}

export const getAllClients = async (req, res) => {
    try {
        const Clients = await Client.find({}, { "password": 0, "__v": 0 });
        res.status(200).json({ success: true, data: Clients });
    }
    catch (error) {
        logger.error(`Error getting all Clients: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findById(id, { password: 0, __v: 0 });

        res.status(200).json({ success: true, data: client });
    } catch (error) {
        logger.error(`Error getting client by ID: ${error.message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const updateClient = await Client.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({ success: true, message: 'Client updated successfully', data: updateClient });
    }
    catch (error) {
        logger.error(`Error updating Client: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        await Client.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Client deleted successfully' });
    }
    catch (error) {
        logger.error(`Error deleting client: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};





// add image to  both client and driver

export const uploadImage = async (req, res) => {
  try {
    let role, id;

    if (req.params.role && req.params.id) {
      role = req.params.role;
      id = req.params.id;
    } else {

      role = req.user.role;
      id = req.user.id;
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    

    const imageUrl = await uploadToCloudinary(req.file);

  
    let model;
    if (role === "client") {
      model = Client;
    } else if (role === "driver") {
      model = Driver;
    } else {
      return res.status(400).json({ message: "Invalid role. Must be 'client' or 'driver'." });
    }

    
    const updatedDoc = await model.findByIdAndUpdate(
      id,
      { image: imageUrl },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: `${role} not found` });
    }

    res.status(200).json({
      message: `${role} image uploaded/updated successfully`,
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: error.message });
  }
};
