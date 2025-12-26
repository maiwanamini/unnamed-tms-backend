import Company from "../models/Company.js";
import User from "../models/User.js";

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .sort({ createdAt: -1 })
      .populate("recipients", "firstName lastName email phone");
    res.status(200).json(companies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch companies", error: error.message });
  }
};

// @desc    Get a single company
// @route   GET /api/companies/:id
// @access  Private
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      "recipients",
      "firstName lastName email phone"
    );
    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json(company);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch company", error: error.message });
  }
};

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private
const createCompany = async (req, res) => {
  try {
    const { name, email, phone, address, recipients } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const owner = await User.findById(req.user._id);
    if (!owner) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (owner.company) {
      return res.status(400).json({ message: "User already belongs to a company" });
    }

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "name, email, and phone are required",
      });
    }

    const generateCompanyId = () => String(Math.floor(10000 + Math.random() * 90000));
    let generatedCompanyId = generateCompanyId();
    for (let i = 0; i < 10; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await Company.exists({ companyId: generatedCompanyId });
      if (!exists) break;
      generatedCompanyId = generateCompanyId();
    }

    const stillExists = await Company.exists({ companyId: generatedCompanyId });
    if (stillExists) {
      return res.status(500).json({ message: "Could not generate unique companyId" });
    }

    const recipientsList = Array.isArray(recipients) ? recipients : [];

    const company = await Company.create({
      owner: owner._id,
      name,
      companyId: generatedCompanyId,
      email,
      phone,
      address,
      recipients: recipientsList,
    });

    owner.company = company._id;
    await owner.save();

    const safeOwner = await User.findById(owner._id).select("-password");
    res.status(201).json({ company, user: safeOwner });
  } catch (error) {
    if (error?.code === 11000) {
      if (error?.keyPattern?.companyId) {
        return res.status(409).json({ message: "Company ID already exists" });
      }
      if (error?.keyPattern?.email) {
        return res.status(409).json({ message: "Company email already exists" });
      }
      if (error?.keyPattern?.owner) {
        return res.status(409).json({ message: "Owner already has a company" });
      }
    }
    res
      .status(500)
      .json({ message: "Failed to create company", error: error.message });
  }
};

// @desc    Update a company
// @route   PUT /api/companies/:id
// @access  Private
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("recipients", "firstName lastName email phone");

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json(company);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update company", error: error.message });
  }
};

// @desc    Delete a company
// @route   DELETE /api/companies/:id
// @access  Private
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ message: "Company deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete company", error: error.message });
  }
};

// @desc    Add recipients to a company
// @route   POST /api/companies/:id/recipients
// @access  Private
const addRecipients = async (req, res) => {
  try {
    const { recipientIds } = req.body;

    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res
        .status(400)
        .json({ message: "recipientIds must be a non-empty array" });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { recipients: { $each: recipientIds } } },
      { new: true }
    ).populate("recipients", "firstName lastName email phone");

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json(company);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add recipients", error: error.message });
  }
};

// @desc    Remove a recipient from a company
// @route   DELETE /api/companies/:id/recipients/:userId
// @access  Private
const removeRecipient = async (req, res) => {
  try {
    const { userId } = req.params;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $pull: { recipients: userId } },
      { new: true }
    ).populate("recipients", "firstName lastName email phone");

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json(company);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove recipient", error: error.message });
  }
};

export {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  addRecipients,
  removeRecipient,
};
