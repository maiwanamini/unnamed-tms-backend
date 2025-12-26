import express from "express";
import { protect, requireCompany } from "../middleware/authMiddleware.js";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

const router = express.Router();

// GET all clients
router.get("/", protect, requireCompany, getClients);

// GET single client
router.get("/:id", protect, requireCompany, getClientById);

// CREATE client
router.post("/", protect, requireCompany, createClient);

// UPDATE client
router.put("/:id", protect, requireCompany, updateClient);

// DELETE client
router.delete("/:id", protect, requireCompany, deleteClient);

export default router;
