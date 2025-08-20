import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ["Client", "Driver"], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["trip", "payment", "system"], default: "system" },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;   
