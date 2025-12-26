import express from "express";
import {
  getStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
} from "../controllers/stopController.js";
import { protect, requireCompany } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all stops
router.get("/", protect, requireCompany, getStops);

// GET single stop
router.get("/:id", protect, requireCompany, getStopById);

// CREATE stop
router.post("/", protect, requireCompany, createStop);

// UPDATE stop
router.put("/:id", protect, requireCompany, updateStop);

// DELETE stop
router.delete("/:id", protect, requireCompany, deleteStop);

export default router;
