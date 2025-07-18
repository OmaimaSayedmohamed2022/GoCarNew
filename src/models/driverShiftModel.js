import mongoose from "mongoose";

const driverShiftSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  carType: { type: String, required: true },
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],
  status: { type: String, enum: ["ongoing", "ended"], default: "ongoing" },
  startTime: { type: Date },
  endTime: { type: Date }, 
},
{ timestamps: true }
);

export default mongoose.model("DriverShift", driverShiftSchema);
