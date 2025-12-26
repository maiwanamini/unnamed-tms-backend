import dotenv from "dotenv";
import mongoose from "mongoose";

import Order from "../src/models/Order.js";
import Truck from "../src/models/Truck.js";
import Trailer from "../src/models/Trailer.js";
import Stop from "../src/models/Stop.js";
import Client from "../src/models/Client.js";
import Partner from "../src/models/Partner.js";

dotenv.config();

const requiredEnv = ["MONGO_URI"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");

  const models = [Order, Truck, Trailer, Stop, Client, Partner];

  for (const model of models) {
    const name = model.modelName;
    try {
      const result = await model.syncIndexes();
      console.log(`${name}: syncIndexes ok`, result);
    } catch (err) {
      console.error(`${name}: syncIndexes failed`, err?.message || err);
      throw err;
    }
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exitCode = 1;
});
