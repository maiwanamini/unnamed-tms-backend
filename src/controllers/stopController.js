import Stop from "../models/Stop.js";
import Order from "../models/Order.js";

// @desc    Get all stops for a specific order
// @route   GET /api/stops?order=:orderId or GET /api/orders/:orderId/stops
// @access  Private
const getStops = async (req, res) => {
  try {
    const { order } = req.query;

    if (!order) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const stops = await Stop.find({ order }).sort({ orderIndex: 1 });
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
    const {
      orderId,
      order,
      orderIndex,
      type,
      locationName,
      address,
      city,
      postalCode,
      plannedTime,
    } = req.body;

    const orderRef = orderId || order;
    if (!orderRef) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    if (orderIndex === undefined) {
      return res.status(400).json({ message: "orderIndex is required" });
    }

    const stop = await Stop.create({
      order: orderRef,
      orderIndex,
      type,
      locationName,
      address,
      city,
      postalCode,
      plannedTime,
    });

    // 2. Push stop ID into order.stops
    await Order.findByIdAndUpdate(orderRef, { $push: { stops: stop._id } });

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

export { getStops, getStopById, createStop, updateStop, deleteStop };
