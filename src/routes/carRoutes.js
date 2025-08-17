import express from "express";
import { createCar, getCars, updateCar, deleteCar } from "../controllers/carController.js";
import upload from "../middlewares/uploadImage.js"

const router = express.Router();

router.post("/", upload.single("image"), createCar);
router.get("/", getCars);
router.put("/:id", updateCar);
router.delete("/:id", deleteCar);

export default router;
