import jwt from "jsonwebtoken";
import Client from "../models/clientModel.js";
import Driver from "../models/driverModel.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === "client") {
      user = await Client.findById(decoded.id);
    } else if (decoded.role === "driver") {
      user = await Driver.findById(decoded.id);
    } else {
      return res.status(400).json({ message: "Invalid role in token." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = {
      id: user._id,
      role: user.role,
      permissions: user.permissions || {},
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      phoneNumber: user.phoneNumber,  
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }  
  );
};