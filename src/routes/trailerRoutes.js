import express from "express";
import {
  getTrailers,
  getTrailerById,
  createTrailer,
  updateTrailer,
  deleteTrailer,
} from "../controllers/trailerController.js";
import { protect, requireCompany } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all trailers
router.get("/", protect, requireCompany, getTrailers);

// GET single trailer
router.get("/:id", protect, requireCompany, getTrailerById);

// CREATE trailer
router.post("/", protect, requireCompany, createTrailer);

// UPDATE trailer
router.put("/:id", protect, requireCompany, updateTrailer);

// DELETE trailer
router.delete("/:id", protect, requireCompany, deleteTrailer);

export default router;
