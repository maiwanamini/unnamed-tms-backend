import express from "express";
import {
  getTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
} from "../controllers/truckController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all trucks
router.get("/", protect, getTrucks);

// GET single truck
router.get("/:id", protect, getTruckById);

// CREATE truck
router.post("/", protect, createTruck);

// UPDATE truck
router.put("/:id", protect, updateTruck);

// DELETE truck
router.delete("/:id", protect, deleteTruck);

export default router;
