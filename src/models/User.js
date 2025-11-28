import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlenght: 8,
    },
  },
  { timestamps: true }
);

// 👉 Virtual fullName
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// 👉 Enable virtuals when sending JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;
