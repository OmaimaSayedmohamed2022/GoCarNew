import Car from  "../models/carModel.js";
import uploadToCloudinary from "../middlewares/uploadToCloudinary.js";

// add new car
export const createCar = async (req, res) => {
  try {
    const { carPlate, carModel, carColor, companyNumber, status} = req.body;

     const photoUrl = await uploadToCloudinary(req.file);
    const car = await Car.create({
      carPlate,
      carModel,
      carColor,
      companyNumber,
      status,
      photoUrl
    });

    res.status(201).json({ success: true, message: "Car added successfully", car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all cars
export const getCars = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const cars = await Car.find(query);
    res.json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update car info
export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findByIdAndUpdate(id, req.body, { new: true });

    if (!car) return res.status(404).json({ success: false, message: "Car not found" });

    res.json({ success: true, message: "Car updated successfully", car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete car
export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findByIdAndDelete(id);

    if (!car) return res.status(404).json({ success: false, message: "Car not found" });

    res.json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
