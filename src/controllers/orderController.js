import Order from "../models/Order.js";
import Stop from "../models/Stop.js";
import Trailer from "../models/Trailer.js";
import Truck from "../models/Truck.js";
import User from "../models/User.js";
import { deleteImage, uploadImageBuffer } from "../utils/cloudinary.js";

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ company: req.user.company })
      .sort({ orderNumber: 1 })
      .populate("truck")
      .populate("trailer")
      .populate("driver", "-password")
      .populate("stops");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, company: req.user.company })
      .populate("truck")
      .populate("trailer")
      .populate("driver", "-password")
      .populate("stops");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (admin/dashboard)
const createOrder = async (req, res) => {
  try {
    const { truck, trailer, driver, ...rest } = req.body || {};

    if (truck) {
      const truckDoc = await Truck.findOne({ _id: truck, company: req.user.company });
      if (!truckDoc) {
        return res.status(400).json({ message: "Invalid truck for company" });
      }
    }

    if (trailer) {
      const trailerDoc = await Trailer.findOne({ _id: trailer, company: req.user.company });
      if (!trailerDoc) {
        return res.status(400).json({ message: "Invalid trailer for company" });
      }
    }

    if (driver) {
      const driverDoc = await User.findOne({ _id: driver, company: req.user.company });
      if (!driverDoc) {
        return res.status(400).json({ message: "Invalid driver for company" });
      }
    }

    const newOrder = await Order.create({
      ...rest,
      truck: truck || null,
      trailer: trailer || null,
      driver: driver || null,
      company: req.user.company,
    });
    res.status(201).json(newOrder);
  } catch (error) {
    console.log("Create order error:", error.message);
    res
      .status(400)
      .json({ message: "Invalid order data", error: error.message });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private (admin/dashboard)
const updateOrder = async (req, res) => {
  try {
    if (req.body?.truck) {
      const truckDoc = await Truck.findOne({ _id: req.body.truck, company: req.user.company });
      if (!truckDoc) {
        return res.status(400).json({ message: "Invalid truck for company" });
      }
    }

    if (req.body?.trailer) {
      const trailerDoc = await Trailer.findOne({ _id: req.body.trailer, company: req.user.company });
      if (!trailerDoc) {
        return res.status(400).json({ message: "Invalid trailer for company" });
      }
    }

    if (req.body?.driver) {
      const driverDoc = await User.findOne({ _id: req.body.driver, company: req.user.company });
      if (!driverDoc) {
        return res.status(400).json({ message: "Invalid driver for company" });
      }
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      req.body,
      { new: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Failed to update order" });
  }
};

// @desc    Add or update extra order info + optional proof image
// @route   PUT /api/orders/:id/extra-info
// @access  Private
const updateOrderExtraInfo = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, company: req.user.company });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const {
      drivenForCompany,
      startTime,
      endTime,
      startKilometers,
      endKilometers,
    } = req.body;

    const extraInfoUpdates = {
      drivenForCompany,
      startTime,
      endTime,
      startKilometers,
      endKilometers,
    };

    let proofImageUrl;
    let proofImagePublicId;

    if (req.file && req.file.buffer) {
      if (order.extraInfo?.proofImagePublicId) {
        await deleteImage(order.extraInfo.proofImagePublicId);
      }

      const uploadResult = await uploadImageBuffer(
        req.file.buffer,
        `orders/${order._id}`
      );

      proofImageUrl = uploadResult.url;
      proofImagePublicId = uploadResult.publicId;
    }

    const cleanedExtraInfo = { ...(order.extraInfo || {}) };
    Object.entries(extraInfoUpdates).forEach(([key, value]) => {
      if (value !== undefined) cleanedExtraInfo[key] = value;
    });

    if (proofImageUrl && proofImagePublicId) {
      cleanedExtraInfo.proofImageUrl = proofImageUrl;
      cleanedExtraInfo.proofImagePublicId = proofImagePublicId;
    }

    order.extraInfo = cleanedExtraInfo;

    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("Update extra info error:", error.message);
    res.status(400).json({ message: "Failed to update extra info" });
  }
};

// @desc    Delete order + delete related stops
// @route   DELETE /api/orders/:id
// @access  Private (admin/dashboard)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, company: req.user.company });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Delete all stops linked to this order
    await Stop.deleteMany({ order: order._id, company: req.user.company });

    await order.deleteOne();

    res.status(200).json({ message: "Order and related stops deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order" });
  }
};

export {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderExtraInfo,
};
