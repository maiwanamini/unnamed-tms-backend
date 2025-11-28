import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// REGISTER new user (admin creates drivers later — but this stays for now)
router.post("/register", registerUser);

// LOGIN user
router.post("/login", loginUser);

export default router;
