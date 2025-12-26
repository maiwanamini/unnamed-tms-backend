import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Partner = mongoose.model("Partner", partnerSchema);

export default Partner;
