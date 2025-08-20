import express from "express";
import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  getNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/me",  getMyNotifications);


router.patch("/:id/read", markAsRead);

router.delete("/:id",  deleteNotification);

// Get all (dashboard/admin)
router.get("/",   getNotifications);

export default router;
