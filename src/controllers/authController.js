import bcrypt from "bcryptjs";
import Driver from "../models/driverModel.js"
import Client from "../models/clientModel.js";
import logger from "../utils/logger.js";
import { generateToken } from "../middlewares/authMiddleware.js";

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Client.findOne({ email });
    let userType = "Client";

    if (!user) {
        user = await Driver.findOne({ email });
        userType = "Driver";
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid password attempt for phone: ${email}`);
      return res
        .status(401)
        .json({ message: "Invalid Phone Number or Password." });
    }

    const token = generateToken(user);

    logger.info(`User logged in successfully as ${userType}: ${email}`);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
