import express from "express";
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  addRecipients,
  removeRecipient,
} from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET all companies
router.get("/", protect, getCompanies);

// GET single company
router.get("/:id", protect, getCompanyById);

// CREATE company
router.post("/", protect, uploadSingleImage("logo"), createCompany);

// UPDATE company
router.put("/:id", protect, uploadSingleImage("logo"), updateCompany);

// DELETE company
router.delete("/:id", protect, deleteCompany);

// ADD recipients to company
router.post("/:id/recipients", protect, addRecipients);

// REMOVE a recipient from company
router.delete("/:id/recipients/:userId", protect, removeRecipient);

export default router;
