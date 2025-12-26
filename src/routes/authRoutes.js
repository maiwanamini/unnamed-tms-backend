import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// REGISTER new user (admin creates drivers later — but this stays for now)
router.post("/register", uploadSingleImage("avatar"), registerUser);

// LOGIN user
router.post("/login", loginUser);

export default router;
