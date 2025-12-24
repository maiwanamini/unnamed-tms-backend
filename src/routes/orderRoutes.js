import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderExtraInfo,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import uploadProofImage from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET all orders / CREATE a new order
router.route("/").get(protect, getOrders).post(protect, createOrder);

// Add or update extra info + proof image
router
  .route("/:id/extra-info")
  .put(protect, uploadProofImage, updateOrderExtraInfo);

// GET one / UPDATE / DELETE
router
  .route("/:id")
  .get(protect, getOrderById)
  .put(protect, updateOrder)
  .delete(protect, deleteOrder);

export default router;
