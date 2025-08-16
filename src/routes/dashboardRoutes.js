import express from "express";
import { summary } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", summary);

export default router;
