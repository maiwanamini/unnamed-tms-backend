import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    orderIndex: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    locationName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    plannedTime: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

stopSchema.index({ order: 1, orderIndex: 1 }, { unique: true });

const Stop = mongoose.model("Stop", stopSchema);

export default Stop;
