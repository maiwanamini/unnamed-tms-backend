import mongoose from "mongoose";

const trailerSchema = new mongoose.Schema(
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
    trailerNumber: {
      type: String,
    },
    year: {
      type: Number,
    },
    type: {
      type: String,
      enum: [
        "Dry Van",
        "Reefer",
        "Flatbed",
        "Step Deck",
        "Tanker",
        "Lowboy",
        "Curtainside",
        "Hopper-Bottom",
      ],
    },
    status: {
      type: String,
      enum: ["available", "in-use", "maintenance", "active", "inactive"],
      default: "active",
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      default: null,
    },
  },
  { timestamps: true }
);

trailerSchema.index({ company: 1, licensePlate: 1 }, { unique: true, sparse: true });

const Trailer = mongoose.model("Trailer", trailerSchema);

export default Trailer;
