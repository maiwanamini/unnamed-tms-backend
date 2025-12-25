import Trailer from "../models/Trailer.js";
import Truck from "../models/Truck.js";

// @desc    Get all trailers
// @route   GET /api/trailers
// @access  Private
export const getTrailers = async (req, res) => {
  try {
    const trailers = await Trailer.find().populate({
      path: "truck",
      populate: { path: "driver", select: "-password" },
    });
    res.status(200).json(trailers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch trailers", error: error.message });
  }
};

// @desc    Get single trailer
// @route   GET /api/trailers/:id
// @access  Private
export const getTrailerById = async (req, res) => {
  try {
    const trailer = await Trailer.findById(req.params.id).populate({
      path: "truck",
      populate: { path: "driver", select: "-password" },
    });

    if (!trailer) return res.status(404).json({ message: "Trailer not found" });

    res.status(200).json(trailer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch trailer", error: error.message });
  }
};

// @desc    Create a new trailer
// @route   POST /api/trailers
// @access  Private
export const createTrailer = async (req, res) => {
  try {
    const trailer = await Trailer.create(req.body);
    res.status(201).json(trailer);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create trailer", error: error.message });
  }
};

// @desc    Update a trailer
// @route   PUT /api/trailers/:id
// @access  Private
export const updateTrailer = async (req, res) => {
  try {
    const trailer = await Trailer.findById(req.params.id);

    if (!trailer) {
      return res.status(404).json({ message: "Trailer not found" });
    }

    const oldTruckId = trailer.truck;
    const newTruckId = req.body.truck;

    if (oldTruckId?.toString() !== newTruckId?.toString()) {
      // Clear old truck's trailer link
      if (oldTruckId) {
        await Truck.findByIdAndUpdate(oldTruckId, { trailer: null });
      }
      // Set new truck's trailer link
      if (newTruckId) {
        await Truck.findByIdAndUpdate(newTruckId, { trailer: req.params.id });
      }
    }

    Object.assign(trailer, req.body);
    const updated = await trailer.save();
    const populated = await updated.populate("truck");

    res.status(200).json(populated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update trailer", error: error.message });
  }
};

// @desc    Delete a trailer
// @route   DELETE /api/trailers/:id
// @access  Private
export const deleteTrailer = async (req, res) => {
  try {
    const trailer = await Trailer.findByIdAndDelete(req.params.id);

    if (!trailer) {
      return res.status(404).json({ message: "Trailer not found" });
    }

    // Clear truck reference if present
    if (trailer?.truck) {
      await Truck.findByIdAndUpdate(trailer.truck, { trailer: null });
    }

    res.status(200).json({ message: "Trailer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete trailer", error: error.message });
  }
};
