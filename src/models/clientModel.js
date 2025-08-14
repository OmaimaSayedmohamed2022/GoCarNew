import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  rating: { type: Number, min: 1,   max: 5, required: true },
  comment: { type: String, trim: true },
  date: { type: Date, default: Date.no  } });

const clientSchema = new mongoose.Schema({

  
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["driver", "client"], default: "client" },
  invitationCode: { type: String, required: true },
  otp: { type: String },
  isActive: { type: Boolean, default: false },
  reviews:[reviewSchema]
}, { timestamps: true });

export default mongoose.model("Client", clientSchema);
