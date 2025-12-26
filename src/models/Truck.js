import mongoose from "mongoose";

const truckSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },
    licensePlate: {
      type: String,
      required: true,
      // unique handled per-company via indexes
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
    type: {
      type: String,
      enum: [
        "Tractor unit",
        "Rigid / box truck",
        "Refrigerated (reefer) truck",
        "Flatbed truck",
        "Tanker truck",
        "Tip truck / dumper",
        "Van (light commercial)",
      ],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    trailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trailer",
      default: null,
    },
  },
  { timestamps: true }
);

truckSchema.index({ company: 1, licensePlate: 1 }, { unique: true, sparse: true });

const Truck = mongoose.model("Truck", truckSchema);

export default Truck;
