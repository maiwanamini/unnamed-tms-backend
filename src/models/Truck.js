import mongoose from "mongoose";

const truckSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    brand: {
      type: String,
    },
    model: {
      type: String,
    },
    year: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["available", "in-use", "maintenance"],
      default: "available",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Truck = mongoose.model("Truck", truckSchema);

export default Truck;
