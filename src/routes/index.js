import express from "express";
const router = express.Router();

import driverRoutes from "./driverRoutes.js";
import clientRoutes from "./clientRoutes.js"
import authRoutes from "./authRoutes.js"
import driverShiftRoutes from "./driverShiftRoutes.js"
import drivertripRoutes from "./drivertripRoutes.js"
import tripRoutes from "./tripRoutes.js"

router.use("/driver", driverRoutes);
router.use("/client", clientRoutes);
router.use("/auth", authRoutes);
router.use("/driverShift", driverShiftRoutes);
router.use("/drivertrip", drivertripRoutes);
router.use("/trip", tripRoutes);

export default router;
