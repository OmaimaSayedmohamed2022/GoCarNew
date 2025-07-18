import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";
import Client from "../models/clientModel.js";
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