import Order from "../models/Order.js";
import Stop from "../models/Stop.js";

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderNumber: 1 });
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
    const order = await Order.findById(req.params.id);

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
    const newOrder = await Order.create(req.body);
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
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
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

// @desc    Delete order + delete related stops
// @route   DELETE /api/orders/:id
// @access  Private (admin/dashboard)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Delete all stops linked to this order
    await Stop.deleteMany({ order: order._id });

    await order.deleteOne();

    res.status(200).json({ message: "Order and related stops deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order" });
  }
};

export { getOrders, getOrderById, createOrder, updateOrder, deleteOrder };
