import User from "../models/User.js";

// @desc Get current logged-in user
// @route GET /api/users/me
// @access Private
export const getCurrentUser = async (req, res) => {
  try {
    // `protect` middleware attaches the user document to req.user
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("truck")
      .populate("company", "name companyId");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get all users
// @route GET /api/users
// @access Private (admin later, but open for now)
export const getAllUsers = async (req, res) => {
  try {
    // Company scoping: admins only see users in their company.
    // (Drivers shouldn't be in the dashboard; we keep this lightweight for now.)
    const companyId = req.user?.company;

    if (!companyId) {
      const self = await User.findById(req.user?._id).select("-password").populate("truck");
      return res.status(200).json(self ? [self] : []);
    }

    const users = await User.find({ company: companyId }).select("-password").populate("truck");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Create user (driver)
// @route POST /api/users
// @access Private
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (String(req.user?.role || "") !== "admin") {
      return res.status(403).json({ message: "Only admins can create users" });
    }

    if (!req.user?.company) {
      return res.status(400).json({ message: "Admin must belong to a company before creating users" });
    }

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "firstName, lastName, email, and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "driver",
      company: req.user.company,
    });

    const safe = await User.findById(user._id).select("-password").populate("truck");

    return res.status(201).json({ user: safe });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get single user
// @route GET /api/users/:id
// @access Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("truck");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update user
// @route PUT /api/users/:id
// @access Private
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private
export const deleteUser = async (req, res) => {
  try {
    const removed = await User.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
