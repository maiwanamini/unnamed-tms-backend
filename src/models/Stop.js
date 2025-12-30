import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },
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
    region: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    geo: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      mapboxId: { type: String, default: null },
    },
    plannedTime: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
    },
    reference: {
      type: String,
    },
  },
  { timestamps: true }
);

stopSchema.index({ order: 1, orderIndex: 1 }, { unique: true });
stopSchema.index({ company: 1, order: 1, orderIndex: 1 }, { unique: true, sparse: true });

const Stop = mongoose.model("Stop", stopSchema);

export default Stop;
