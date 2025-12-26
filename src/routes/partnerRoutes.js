import express from "express";
import { protect, requireCompany } from "../middleware/authMiddleware.js";
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from "../controllers/partnerController.js";

const router = express.Router();

// GET all partners
router.get("/", protect, requireCompany, getPartners);

// GET single partner
router.get("/:id", protect, requireCompany, getPartnerById);

// CREATE partner
router.post("/", protect, requireCompany, createPartner);

// UPDATE partner
router.put("/:id", protect, requireCompany, updatePartner);

// DELETE partner
router.delete("/:id", protect, requireCompany, deletePartner);

export default router;
