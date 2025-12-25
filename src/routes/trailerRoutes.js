import express from "express";
import {
  getTrailers,
  getTrailerById,
  createTrailer,
  updateTrailer,
  deleteTrailer,
} from "../controllers/trailerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all trailers
router.get("/", protect, getTrailers);

// GET single trailer
router.get("/:id", protect, getTrailerById);

// CREATE trailer
router.post("/", protect, createTrailer);

// UPDATE trailer
router.put("/:id", protect, updateTrailer);

// DELETE trailer
router.delete("/:id", protect, deleteTrailer);

export default router;
