import express from "express";
import {
  startShift,
  endShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift
} from "../controllers/driverShiftController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/start", startShift);

router.patch("/end/:id", endShift);

router.get("/getAll", getAllShifts);

router.get("/getShift/:id", getShiftById);

router.patch("/update/:id", updateShift);

router.delete("/delete/:id", deleteShift);

export default router;