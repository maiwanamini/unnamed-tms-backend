import express from "express";
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all companies
router.get("/", protect, getCompanies);

// GET single company
router.get("/:id", protect, getCompanyById);

// CREATE company
router.post("/", protect, createCompany);

// UPDATE company
router.put("/:id", protect, updateCompany);

// DELETE company
router.delete("/:id", protect, deleteCompany);

export default router;
