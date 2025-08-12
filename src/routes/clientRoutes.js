import express from "express";
import {
  register,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  uploadImage
} from "../controllers/clientController.js";
import { verifyToken } from '../middlewares/authMiddleware.js';
import upload from "../middlewares/uploadImage.js"

const router = express.Router();

router.post("/register", register);

router.get("/getAll", getAllClients);

router.get("/getClient/:id", getClientById);

router.patch("/update/:id", updateClient);

router.delete("/delete/:id", deleteClient);

// add  image
router.post("/:role?/:id?", verifyToken, upload.single("image"), uploadImage);

export default router;
