import Truck from "../models/Truck.js";
import User from "../models/User.js";

// @desc    Get all trucks
// @route   GET /api/trucks
// @access  Private
export const getTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find().populate("driver", "-password");
    res.status(200).json(trucks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch trucks", error: error.message });
  }
};

// @desc    Get single truck
// @route   GET /api/trucks/:id
// @access  Private
export const getTruckById = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id).populate(
      "driver",
      "-password"
    );

    if (!truck) return res.status(404).json({ message: "Truck not found" });

    res.status(200).json(truck);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch truck", error: error.message });
  }
};

// @desc    Create a new truck
// @route   POST /api/trucks
// @access  Private
export const createTruck = async (req, res) => {
  try {
    const truck = await Truck.create(req.body);
    res.status(201).json(truck);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create truck", error: error.message });
  }
};

// @desc    Update a truck
// @route   PUT /api/trucks/:id
// @access  Private
export const updateTruck = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    // Handle driver assignment changes
    const oldDriverId = truck.driver;
    const newDriverId = req.body.driver;

    // If driver is being changed
    if (oldDriverId?.toString() !== newDriverId?.toString()) {
      // Remove truck from old driver
      if (oldDriverId) {
        await User.findByIdAndUpdate(oldDriverId, { truck: null });
      }
      // Assign truck to new driver
      if (newDriverId) {
        await User.findByIdAndUpdate(newDriverId, { truck: req.params.id });
      }
    }

    // Update truck
    Object.assign(truck, req.body);
    const updatedTruck = await truck.save();
    const populatedTruck = await updatedTruck.populate("driver", "-password");

    res.status(200).json(populatedTruck);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update truck", error: error.message });
  }
};

// @desc    Delete a truck
// @route   DELETE /api/trucks/:id
// @access  Private
export const deleteTruck = async (req, res) => {
  try {
    const truck = await Truck.findByIdAndDelete(req.params.id);

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    // Remove truck reference from driver
    if (truck.driver) {
      await User.findByIdAndUpdate(truck.driver, { truck: null });
    }

    res.status(200).json({ message: "Truck deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete truck", error: error.message });
  }
};
