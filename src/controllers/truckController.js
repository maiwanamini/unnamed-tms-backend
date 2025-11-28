// controllers/truckController.js
const Truck = require("../models/Truck");

// @desc    Get all trucks
// @route   GET /api/trucks
// @access  Private
exports.getTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find();
    res.status(200).json(trucks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch trucks", error: error.message });
  }
};

// @desc    Create a new truck
// @route   POST /api/trucks
// @access  Private
exports.createTruck = async (req, res) => {
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
exports.updateTruck = async (req, res) => {
  try {
    const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    res.status(200).json(truck);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update truck", error: error.message });
  }
};

// @desc    Delete a truck
// @route   DELETE /api/trucks/:id
// @access  Private
exports.deleteTruck = async (req, res) => {
  try {
    const truck = await Truck.findByIdAndDelete(req.params.id);

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    res.status(200).json({ message: "Truck deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete truck", error: error.message });
  }
};
