import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // create user (password will be hashed by the User model pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
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

    // DEBUG: log incoming and stored values to help diagnose compare failures
    console.log("Login attempt:", { email });
    console.log(
      "Provided password length:",
      password ? password.length : 0,
      "type:",
      typeof password
    );
    console.log(
      "Stored password hash preview:",
      user.password ? `${user.password.slice(0, 6)}...` : "<none>",
      "(len=",
      user.password ? user.password.length : 0,
      ")"
    );

    // compare passwords
    const match = await bcrypt.compare(password, user.password);
    console.log("bcrypt.compare result:", match);
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
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
