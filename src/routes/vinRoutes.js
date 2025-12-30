import express from "express";
import { decodeVin } from "../controllers/vinController.js";
import { protect, requireCompany } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/decode", protect, requireCompany, decodeVin);

export default router;
