import Company from "../models/Company.js";

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
    const { name, companyId, email, phone, address, recipients } = req.body;

    if (!name || !companyId || !email || !phone) {
      return res.status(400).json({
        message: "name, companyId, email, and phone are required",
      });
    }

    const recipientsList = Array.isArray(recipients) ? recipients : [];

    const company = await Company.create({
      name,
      companyId,
      email,
      phone,
      address,
      recipients: recipientsList,
    });

    res.status(201).json(company);
  } catch (error) {
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
