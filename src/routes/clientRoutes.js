import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

const router = express.Router();

// GET all clients
router.get("/", protect, getClients);

// GET single client
router.get("/:id", protect, getClientById);

// CREATE client
router.post("/", protect, createClient);

// UPDATE client
router.put("/:id", protect, updateClient);

// DELETE client
router.delete("/:id", protect, deleteClient);

export default router;
