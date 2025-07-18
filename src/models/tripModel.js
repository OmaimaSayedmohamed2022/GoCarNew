import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: false },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: false },
  driverShift: { type: mongoose.Schema.Types.ObjectId, ref: "DriverShift", required: false },
  carType: { type: String },
  passengerNo: { type: Number },
  luggageNo: { type: Number },
  currentLocation: {
    address: String,
    lat: Number,
    lng: Number,
  },
  destination: {
    address: String,
    lat: Number,
    lng: Number,
  },
  scheduledAt: { type: Date },
  rideType: { type: String, enum: ["normal", "scheduled"] },
  price: { type: Number },
  
paymentInfo: {
  method: { type: String, enum: ["cash", "visa"], default: "cash" },
  status: { type: String, enum: ["Pending", "Paid", "Success"], default: "Pending" },
  transactionId: String,
  paidAt: Date
},
  notes: { type: String, maxlength: 500 },
  tripCode: { type: String, unique: false },
  status: {
    type: String,
    enum: ["Requested", "Accepted", "Rejected", "Arrived", "Ongoing", "Completed", "Cancelled", "Scheduled"],
    default: "Requested"
  },
    rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    trim: true,
  }
}, { timestamps: true });

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
