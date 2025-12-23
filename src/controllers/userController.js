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

    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get all users
// @route GET /api/users
// @access Private (admin later, but open for now)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get single user
// @route GET /api/users/:id
// @access Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

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
