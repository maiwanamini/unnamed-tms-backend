import Client from "../models/Client.js";

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch clients", error: error.message });
  }
};

// @desc    Get a single client
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    res.status(200).json(client);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch client", error: error.message });
  }
};

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
  try {
    const {
      clientName,
      clientAddress,
      contactName,
      contactEmail,
      contactPhone,
    } = req.body;

    if (
      !clientName ||
      !clientAddress ||
      !contactName ||
      !contactEmail ||
      !contactPhone
    ) {
      return res.status(400).json({
        message:
          "clientName, clientAddress, contactName, contactEmail, and contactPhone are required",
      });
    }

    const client = await Client.create({
      clientName,
      clientAddress,
      contactName,
      contactEmail,
      contactPhone,
    });

    res.status(201).json(client);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create client", error: error.message });
  }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!client) return res.status(404).json({ message: "Client not found" });

    res.status(200).json(client);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update client", error: error.message });
  }
};

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) return res.status(404).json({ message: "Client not found" });

    res.status(200).json({ message: "Client deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete client", error: error.message });
  }
};

export { getClients, getClientById, createClient, updateClient, deleteClient };
