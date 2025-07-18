// import mongoose from "mongoose";

// const tripSchema = new mongoose.Schema({
//   client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
//   driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver"},
//   driverShift : { type: mongoose.Schema.Types.ObjectId, ref: "DriverShift", required: true },
//   carType: { type: String },
//   rideType: { type: String, enum: ["normal", "scheduled"], required: true },
//   scheduledTime: { type: Date },
//   notes: { type: String, maxlength: 500 },
//   startLocation: {
//     address: { type: String },
//     lat: { type: Number },
//     lng: { type: Number }
//   },
//   endLocation: {
//     address: { type: String },
//     lat: { type: Number },
//     lng: { type: Number }
//   },
//   price: { type: Number, required: true },
//   paymentMethod: { type: String, enum: ["cash", "visa"], required: true },
//   status: { 
//     type: String, 
//     enum: ["pending", "accepted", "rejected", "arrived", "ongoing", "completed", "cancelled"], 
//     default: "pending" 
//   },
//   cancelReason: { type: String },
//   startTime: { type: Date },
//   endTime: { type: Date },
//   tripDistance: { type: Number },
//   tripDuration: { type: Number },
//   cancelReason: { type: String },
//   tripCode: { type: String, unique: false },
//   passengerRating: {
//   type: Number,
//   min: 1,
//   max: 5
// }

// }, { timestamps: true });

// export default mongoose.model("DriverTrip", tripSchema);
