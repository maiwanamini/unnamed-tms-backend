// controllers/stopController.js
const Stop = require("../models/stopModel");

// @desc    Get all stops
// @route   GET /api/stops
// @access  Private
const getStops = async (req, res) => {
  try {
    const stops = await Stop.find().sort({ orderIndex: 1 });
    res.status(200).json(stops);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch stops", error: error.message });
  }
};

// @desc    Get a single stop
// @route   GET /api/stops/:id
// @access  Private
const getStopById = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) return res.status(404).json({ message: "Stop not found" });

    res.status(200).json(stop);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch stop", error: error.message });
  }
};

// @desc    Create a new stop
// @route   POST /api/stops
// @access  Private
const createStop = async (req, res) => {
  try {
    const { order, address, orderIndex, note } = req.body;

    const stop = await Stop.create({
      order,
      address,
      orderIndex,
      note,
    });

    res.status(201).json(stop);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create stop", error: error.message });
  }
};

// @desc    Update a stop
// @route   PUT /api/stops/:id
// @access  Private
const updateStop = async (req, res) => {
  try {
    const stop = await Stop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!stop) return res.status(404).json({ message: "Stop not found" });

    res.status(200).json(stop);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update stop", error: error.message });
  }
};

// @desc    Delete a stop
// @route   DELETE /api/stops/:id
// @access  Private
const deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findByIdAndDelete(req.params.id);

    if (!stop) return res.status(404).json({ message: "Stop not found" });

    res.status(200).json({ message: "Stop deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete stop", error: error.message });
  }
};

module.exports = {
  getStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
};
