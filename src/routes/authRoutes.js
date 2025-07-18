import express from "express";
const router = express.Router();
import { loginUser } from "../controllers/authController.js";
import {
  resetPassword,
  requestPasswordReset,
  verifyCode
} from "../controllers/resetPasswordController.js";

router.post("/login", loginUser);

// forgetPassword
router.post("/forget-password", requestPasswordReset);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);

export default router;
