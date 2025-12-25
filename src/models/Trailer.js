import mongoose from "mongoose";

const trailerSchema = new mongoose.Schema(
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
      enum: ["available", "in-use", "maintenance"],
      default: "available",
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      default: null,
    },
  },
  { timestamps: true }
);

const Trailer = mongoose.model("Trailer", trailerSchema);

export default Trailer;
