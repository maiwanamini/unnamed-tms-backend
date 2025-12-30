import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
    },
    companyId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
      default: "",
    },
    logoPublicId: {
      type: String,
      default: "",
    },
    address: {
      type: String,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

export default Company;
