import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["driver", "client"], default: "client" },
  invitationCode: { type: String, required: true },
  otp: { type: String },
  isActive: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Client", clientSchema);
