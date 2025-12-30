import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import stopRoutes from "./routes/stopRoutes.js";
import truckRoutes from "./routes/truckRoutes.js";
import trailerRoutes from "./routes/trailerRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import vinRoutes from "./routes/vinRoutes.js";
import geoRoutes from "./routes/geoRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug log on each request (optional, but very useful)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/trailers", trailerRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/vin", vinRoutes);
app.use("/api/geo", geoRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    // Start server only after DB connects
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
