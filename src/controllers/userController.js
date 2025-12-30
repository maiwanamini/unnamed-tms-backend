import User from "../models/User.js";
import { deleteImage, uploadImageBuffer } from "../utils/cloudinary.js";

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
      .populate("company", "name companyId logoUrl");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update current logged-in user
// @route PUT /api/users/me
// @access Private
export const updateCurrentUser = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const firstName = req.body?.firstName !== undefined ? String(req.body.firstName || "").trim() : undefined;
    const lastName = req.body?.lastName !== undefined ? String(req.body.lastName || "").trim() : undefined;
    const email = req.body?.email !== undefined ? String(req.body.email || "").trim() : undefined;
    const phone = req.body?.phone !== undefined ? String(req.body.phone || "").trim() : undefined;
    const language = req.body?.language !== undefined ? String(req.body.language || "").trim() : undefined;

    const me = await User.findById(req.user._id);
    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email !== undefined && email && email !== me.email) {
      const exists = await User.findOne({ email, _id: { $ne: me._id } });
      if (exists) {
        return res.status(400).json({
          message: "Email already in use.",
          field: "email",
          code: "EMAIL_IN_USE",
        });
      }
    }

    // Optional: keep phone unique within company (when applicable)
    if (phone !== undefined && phone && me.company) {
      const phoneExists = await User.findOne({ company: me.company, phone, _id: { $ne: me._id } });
      if (phoneExists) {
        return res.status(400).json({
          message: "Phone already in use.",
          field: "phone",
          code: "PHONE_IN_USE",
        });
      }
    }

    if (firstName !== undefined) me.firstName = firstName;
    if (lastName !== undefined) me.lastName = lastName;
    if (email !== undefined) me.email = email;
    if (phone !== undefined) me.phone = phone;
    if (language !== undefined) me.language = language || "en";

    if (req.file) {
      try {
        if (me.avatarPublicId) {
          await deleteImage(me.avatarPublicId);
        }
        const uploaded = await uploadImageBuffer(req.file.buffer, "avatars");
        me.avatarUrl = uploaded.url;
        me.avatarPublicId = uploaded.publicId;
      } catch (e) {
        const msg = e?.message || "Failed to upload avatar";
        return res.status(400).json({ message: msg, code: e?.code || "AVATAR_UPLOAD_FAILED" });
      }
    }

    await me.save();

    const safe = await User.findById(me._id)
      .select("-password")
      .populate("truck")
      .populate("company", "name companyId logoUrl");

    return res.status(200).json(safe);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Change current user's password
// @route PUT /api/users/me/password
// @access Private
export const changeMyPassword = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await user.matchPassword(currentPassword);
    if (!ok) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated" });
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
      return res.status(400).json({
        message: "Email already in use.",
        field: "email",
        code: "EMAIL_IN_USE",
      });
    }

    if (phone) {
      const phoneExists = await User.findOne({ company: req.user.company, phone });
      if (phoneExists) {
        return res.status(400).json({
          message: "Phone already in use.",
          field: "phone",
          code: "PHONE_IN_USE",
        });
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "driver",
      status: "active",
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
    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const isAdmin = String(req.user?.role || "") === "admin";
    const isSelf = String(req.params.id) === String(req.user._id);
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    // Admins may only update users in their company.
    if (isAdmin && req.user?.company && String(target.company || "") !== String(req.user.company)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updates = {};

    if (req.body?.firstName !== undefined) updates.firstName = String(req.body.firstName || "").trim();
    if (req.body?.lastName !== undefined) updates.lastName = String(req.body.lastName || "").trim();
    if (req.body?.email !== undefined) updates.email = String(req.body.email || "").trim();
    if (req.body?.phone !== undefined) updates.phone = String(req.body.phone || "").trim();
    if (req.body?.language !== undefined) updates.language = String(req.body.language || "").trim() || "en";

    if (req.body?.status !== undefined) {
      const s = String(req.body.status || "").trim().toLowerCase();
      if (s !== "active" && s !== "inactive") {
        return res.status(400).json({ message: "Invalid status", field: "status", code: "INVALID_STATUS" });
      }
      updates.status = s;
    }

    if (updates.email !== undefined && updates.email && updates.email !== target.email) {
      const exists = await User.findOne({ email: updates.email, _id: { $ne: target._id } });
      if (exists) {
        return res.status(400).json({
          message: "Email already in use.",
          field: "email",
          code: "EMAIL_IN_USE",
        });
      }
    }

    if (updates.phone !== undefined && updates.phone && target.company) {
      const phoneExists = await User.findOne({ company: target.company, phone: updates.phone, _id: { $ne: target._id } });
      if (phoneExists) {
        return res.status(400).json({
          message: "Phone already in use.",
          field: "phone",
          code: "PHONE_IN_USE",
        });
      }
    }

    Object.assign(target, updates);
    await target.save();

    const safe = await User.findById(target._id)
      .select("-password")
      .populate("truck")
      .populate("company", "name companyId logoUrl");

    return res.status(200).json(safe);
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
