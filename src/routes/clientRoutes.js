import express from "express";
import {
  register,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/register", register);

router.get("/getAll", getAllClients);

router.get("/getClient/:id", getClientById);

router.patch("/update/:id", updateClient);

router.delete("/delete/:id", deleteClient);

export default router;