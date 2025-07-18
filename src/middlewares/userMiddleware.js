import mongoose from "mongoose";
import logger from "../utils/logger.js";

const userMiddleware = (Model) => async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
      }
      const doc = await Model.findById(id);
      if (!doc) {
        return res.status(404).json({ success: false, message: "Not found!" });
      }
      req.document = doc;
    }
    next();
  } catch (error) {
    logger.error("Error in userMiddleware:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default userMiddleware;
