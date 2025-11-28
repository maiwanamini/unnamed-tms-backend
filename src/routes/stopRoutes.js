import express from "express";
import {
  getStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
} from "../controllers/stopController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all stops
router.get("/", protect, getStops);

// GET single stop
router.get("/:id", protect, getStopById);

// CREATE stop
router.post("/", protect, createStop);

// UPDATE stop
router.put("/:id", protect, updateStop);

// DELETE stop
router.delete("/:id", protect, deleteStop);

export default router;
