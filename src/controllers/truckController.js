import Truck from "../models/Truck.js";
import User from "../models/User.js";
import Trailer from "../models/Trailer.js";

// @desc    Get all trucks
// @route   GET /api/trucks
// @access  Private
export const getTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find({ company: req.user.company })
      .populate("driver", "-password")
      .populate("trailer");
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
    const truck = await Truck.findOne({ _id: req.params.id, company: req.user.company })
      .populate("driver", "-password")
      .populate("trailer");

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
    const { driver, trailer, ...rest } = req.body || {};

    if (driver) {
      const driverDoc = await User.findOne({ _id: driver, company: req.user.company });
      if (!driverDoc) {
        return res.status(400).json({ message: "Invalid driver for company" });
      }
    }

    if (trailer) {
      const trailerDoc = await Trailer.findOne({ _id: trailer, company: req.user.company });
      if (!trailerDoc) {
        return res.status(400).json({ message: "Invalid trailer for company" });
      }
    }

    const truck = await Truck.create({ ...rest, driver: driver || null, trailer: trailer || null, company: req.user.company });
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
    const truck = await Truck.findOne({ _id: req.params.id, company: req.user.company });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    // Handle driver assignment changes
    const oldDriverId = truck.driver;
    const newDriverId = req.body.driver;

    if (newDriverId) {
      const newDriver = await User.findOne({ _id: newDriverId, company: req.user.company });
      if (!newDriver) {
        return res.status(400).json({ message: "Invalid driver for company" });
      }
    }

    // If driver is being changed
    if (oldDriverId?.toString() !== newDriverId?.toString()) {
      // Remove truck from old driver
      if (oldDriverId) {
        await User.findOneAndUpdate(
          { _id: oldDriverId, company: req.user.company },
          { truck: null }
        );
      }
      // Assign truck to new driver
      if (newDriverId) {
        await User.findOneAndUpdate(
          { _id: newDriverId, company: req.user.company },
          { truck: req.params.id }
        );
      }
    }

    // Handle trailer assignment changes
    const oldTrailerId = truck.trailer;
    const newTrailerId = req.body.trailer;

    if (newTrailerId) {
      const newTrailer = await Trailer.findOne({ _id: newTrailerId, company: req.user.company });
      if (!newTrailer) {
        return res.status(400).json({ message: "Invalid trailer for company" });
      }
    }

    if (oldTrailerId?.toString() !== newTrailerId?.toString()) {
      if (oldTrailerId) {
        await Trailer.findOneAndUpdate(
          { _id: oldTrailerId, company: req.user.company },
          { truck: null }
        );
      }
      if (newTrailerId) {
        await Trailer.findOneAndUpdate(
          { _id: newTrailerId, company: req.user.company },
          { truck: req.params.id }
        );
      }
    }

    // Update truck
    Object.assign(truck, req.body);
    const updatedTruck = await truck.save();
    const populatedTruck = await updatedTruck
      .populate("driver", "-password")
      .populate("trailer");

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
    const truck = await Truck.findOneAndDelete({ _id: req.params.id, company: req.user.company });

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    // Remove truck reference from driver
    if (truck.driver) {
      await User.findOneAndUpdate(
        { _id: truck.driver, company: req.user.company },
        { truck: null }
      );
    }

    // Remove truck reference from trailer
    if (truck.trailer) {
      await Trailer.findOneAndUpdate(
        { _id: truck.trailer, company: req.user.company },
        { truck: null }
      );
    }

    res.status(200).json({ message: "Truck deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete truck", error: error.message });
  }
};
