import express from "express";
import {
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET current user (protected)
router.get("/me", protect, getCurrentUser);

// GET all users (protected)
router.get("/", protect, getAllUsers);

// GET single user (protected)
router.get("/:id", protect, getUserById);

// UPDATE user (protected)
router.put("/:id", protect, updateUser);

// DELETE user (protected)
router.delete("/:id", protect, deleteUser);

export default router;
