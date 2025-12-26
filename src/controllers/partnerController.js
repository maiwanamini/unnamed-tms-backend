import Partner from "../models/Partner.js";

// @desc    Get all partners
// @route   GET /api/partners
// @access  Private
export const getPartners = async (req, res) => {
  try {
    const partners = await Partner.find({ company: req.user.company }).sort({ createdAt: -1 });
    res.status(200).json(partners);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch partners", error: error.message });
  }
};

// @desc    Get a single partner
// @route   GET /api/partners/:id
// @access  Private
export const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findOne({ _id: req.params.id, company: req.user.company });
    if (!partner) return res.status(404).json({ message: "Partner not found" });

    res.status(200).json(partner);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch partner", error: error.message });
  }
};

// @desc    Create a new partner
// @route   POST /api/partners
// @access  Private
export const createPartner = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const partner = await Partner.create({ name, company: req.user.company });

    res.status(201).json(partner);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create partner", error: error.message });
  }
};

// @desc    Update a partner
// @route   PUT /api/partners/:id
// @access  Private
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      req.body,
      {
      new: true,
      runValidators: true,
      }
    );

    if (!partner) return res.status(404).json({ message: "Partner not found" });

    res.status(200).json(partner);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update partner", error: error.message });
  }
};

// @desc    Delete a partner
// @route   DELETE /api/partners/:id
// @access  Private
export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findOneAndDelete({ _id: req.params.id, company: req.user.company });

    if (!partner) return res.status(404).json({ message: "Partner not found" });

    res.status(200).json({ message: "Partner deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete partner", error: error.message });
  }
};
