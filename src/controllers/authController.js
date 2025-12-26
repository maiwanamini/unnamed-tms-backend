import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { uploadImageBuffer } from "../utils/cloudinary.js";

const safeTrim = (v) => String(v || "").trim();
export const registerUser = async (req, res) => {
  try {
    const firstName = safeTrim(req.body?.firstName);
    const lastName = safeTrim(req.body?.lastName);
    const email = safeTrim(req.body?.email);
    const password = String(req.body?.password || "");

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "firstName, lastName, email, and password are required",
      });
    }

    // check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "Email already in use.",
        field: "email",
        code: "EMAIL_IN_USE",
      });
    }

    let avatarUrl = "";
    let avatarPublicId = "";
    if (req.file?.buffer) {
      try {
        const uploaded = await uploadImageBuffer(req.file.buffer, "avatars");
        avatarUrl = uploaded?.url || "";
        avatarPublicId = uploaded?.publicId || "";
      } catch (uploadErr) {
        console.error("Avatar upload failed", uploadErr?.message || uploadErr);

        if (uploadErr?.code === "CLOUDINARY_NOT_CONFIGURED") {
          return res.status(503).json({
            message:
              "Avatar uploads are not configured on the server. Please register without a profile picture for now.",
            field: "avatar",
            code: "AVATAR_UPLOAD_NOT_CONFIGURED",
          });
        }
        return res.status(400).json({
          message: "Avatar upload failed. Please try again, or register without a profile picture.",
          field: "avatar",
          code: "AVATAR_UPLOAD_FAILED",
        });
      }
    }

    // create user (password will be hashed by the User model pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: "admin",
      avatarUrl,
      avatarPublicId,
    });

    // generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // compare passwords
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
