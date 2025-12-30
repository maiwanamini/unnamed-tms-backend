import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { autocomplete, directions } from "../controllers/geoController.js";

const router = express.Router();

router.get("/autocomplete", protect, autocomplete);
router.get("/directions", protect, directions);

export default router;
