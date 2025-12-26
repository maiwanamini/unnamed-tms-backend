import express from "express";
import {
  getTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
} from "../controllers/truckController.js";
import { protect, requireCompany } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all trucks
router.get("/", protect, requireCompany, getTrucks);

// GET single truck
router.get("/:id", protect, requireCompany, getTruckById);

// CREATE truck
router.post("/", protect, requireCompany, createTruck);

// UPDATE truck
router.put("/:id", protect, requireCompany, updateTruck);

// DELETE truck
router.delete("/:id", protect, requireCompany, deleteTruck);

export default router;
