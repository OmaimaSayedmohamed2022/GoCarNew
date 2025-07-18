import { body } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.js";
import User from "../models/userModel.js";

export const userValidation = (isUpdate = false) => [
  body("phoneNumber")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?\d{10,15}$/)
    .withMessage("Invalid phone number")
    .custom(async (value) => {
      const existingUser = await User.findOne({ phoneNumber: value });
      if (existingUser) {
        throw new Error("Phone number already registered");
      }
    }),

  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters"),

  body("invitationCode")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("Invitation code is required"),

  body("role")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["client", "driver"])
    .withMessage("Invalid role"),

  body("password")
    .if(() => !isUpdate)
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("licenseImage")
    .optional()
    .isString()
    .withMessage("License image must be a string"),

  body("companyNumber")
    .optional()
    .isString()
    .withMessage("Company number must be a string"),

  validateRequest,
];
