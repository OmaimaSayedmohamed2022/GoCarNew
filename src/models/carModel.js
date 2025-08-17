import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  carPlate: { type: String, required: true, unique: true },
  carModel: { type: String, required: true },
  carColor: { type: String, required: true },
  companyNumber: { type: String },
  photoUrl: { type: String }, 
  status: { 
    type: String, 
    enum: ["Active", "Available", "Inactive"], 
    default: "Available" 
  },
}, { timestamps: true });

export default mongoose.model("Car", carSchema);
