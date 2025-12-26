import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderExtraInfo,
} from "../controllers/orderController.js";
import { protect, requireCompany } from "../middleware/authMiddleware.js";
import uploadProofImage from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET all orders / CREATE a new order
router.route("/").get(protect, requireCompany, getOrders).post(protect, requireCompany, createOrder);

// Add or update extra info + proof image
router
  .route("/:id/extra-info")
  .put(protect, requireCompany, uploadProofImage, updateOrderExtraInfo);

// GET one / UPDATE / DELETE
router
  .route("/:id")
  .get(protect, requireCompany, getOrderById)
  .put(protect, requireCompany, updateOrder)
  .delete(protect, requireCompany, deleteOrder);

export default router;
