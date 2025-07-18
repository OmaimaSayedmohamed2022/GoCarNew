import express from "express";
import {
  register,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  updateStatusOnline,
  updateStatusOffline,
  acceptCash,
  refuseCash
} from "../controllers/driverController.js";
import upload from "../middlewares/uploadImage.js";
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/register", upload.single("licenseImage"), register);

router.get("/getAll", getAllDrivers);

router.get("/getDriver/:id", getDriverById);

router.patch("/update/:id", upload.single("licenseImage"), updateDriver);

router.delete("/delete/:id", deleteDriver);

router.patch("/beOnline/:id", updateStatusOnline);

router.patch("/beOffline/:id", updateStatusOffline);

router.patch("/acceptCash/:id", acceptCash);

router.patch("/refuseCash/:id", refuseCash);

export default router;
