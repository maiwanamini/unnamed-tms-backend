import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true, // Example: "O-01", "O-02", ...
    },

    orderIndex: {
      type: Number,
      required: true,
      unique: true, // Used for sorting + drag & drop
    },
    customerName: {
      type: String,
      required: true,
    },
    customerAddress: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
    },
    note: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      default: null,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    stops: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stop" }],
  },
  { timestamps: true }
);

// ------------------------------------------
// AUTO‑GENERATE ORDER NUMBER (O-01, O-02,...)
// ------------------------------------------
orderSchema.pre("validate", async function (next) {
  if (!this.isNew) return next(); // Only for new orders

  try {
    // Get the highest existing orderIndex
    const latestOrder = await mongoose
      .model("Order")
      .findOne({})
      .sort({ orderIndex: -1 });

    const nextIndex = latestOrder ? latestOrder.orderIndex + 1 : 1;

    this.orderIndex = nextIndex;

    // Format orderNumber as O-01, O-02, O-03...
    this.orderNumber = `O-${String(nextIndex).padStart(2, "0")}`;

    next();
  } catch (err) {
    next(err);
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
