import express from "express";
import {
  getStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
} from "../controllers/stopController.js";

const router = express.Router();

// GET all stops
router.get("/", getStops);

// GET single stop
router.get("/:id", getStopById);

// CREATE stop
router.post("/", createStop);

// UPDATE stop
router.put("/:id", updateStop);

// DELETE stop
router.delete("/:id", deleteStop);

export default router;
