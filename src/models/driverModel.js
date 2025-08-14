import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["driver", "client"], default: "driver" },
  companyNumber: { type: String },
  invitationCode: { type: String, required: true },
  licenseImage: { type: String },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  acceptCash: { type: Boolean, default: true },
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],
  otp: { type: String },
  image:{type:String}
}, { timestamps: true });

export default mongoose.model("Driver", driverSchema);
