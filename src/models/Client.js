import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    clientAddress: {
      type: String,
      required: true,
    },
    contactName: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", clientSchema);

export default Client;
