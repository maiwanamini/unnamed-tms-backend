import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all orders / CREATE a new order
router.route("/").get(protect, getOrders).post(protect, createOrder);

// GET one / UPDATE / DELETE
router
  .route("/:id")
  .get(protect, getOrderById)
  .put(protect, updateOrder)
  .delete(protect, deleteOrder);

export default router;
