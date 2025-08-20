import express from "express";
import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  getAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/me",  getMyNotifications);


router.patch("/:id/read", markAsRead);

router.delete("/:id",  deleteNotification);

// Get all (dashboard/admin)
router.get("/",  getAllNotifications);

export default router;
