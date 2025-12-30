import express from "express";
import {
  getCurrentUser,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  updateCurrentUser,
  changeMyPassword,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { maybeUploadSingleImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET current user (protected)
router.get("/me", protect, getCurrentUser);

// UPDATE current user (protected)
router.put("/me", protect, maybeUploadSingleImage("avatar"), updateCurrentUser);

// CHANGE current user's password (protected)
router.put("/me/password", protect, changeMyPassword);

// GET all users (protected)
router.get("/", protect, getAllUsers);

// CREATE user (protected)
router.post("/", protect, createUser);

// GET single user (protected)
router.get("/:id", protect, getUserById);

// UPDATE user (protected)
router.put("/:id", protect, updateUser);

// DELETE user (protected)
router.delete("/:id", protect, deleteUser);

export default router;
