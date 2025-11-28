import express from "express";
import dotenv from "dotenv/config";
import index from "./routes/index.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/", index);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
