import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from "../controllers/partnerController.js";

const router = express.Router();

// GET all partners
router.get("/", protect, getPartners);

// GET single partner
router.get("/:id", protect, getPartnerById);

// CREATE partner
router.post("/", protect, createPartner);

// UPDATE partner
router.put("/:id", protect, updatePartner);

// DELETE partner
router.delete("/:id", protect, deletePartner);

export default router;
