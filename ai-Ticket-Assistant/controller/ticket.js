import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }
    const newTicket = Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: (await newTicket)._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });
    return res.status(201).json({
      message: "Ticket created successfully and process initiated.",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res
      .status(500)
      .json({ message: "Failed to create ticketddd", error: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];

    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("createdBy", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status assignedTo priority helpfulNotes createdAt")
        .sort({ createdAt: -1 });
    }
    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch tickets", error: error.message });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate("createdBy", [
        "email",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        _id: req.params.id,
        createdBy: user._id,
      }).select("title description status assignedTo priority helpfulNotes relatedSkills createdAt");
    }
    

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    console.log("Returned ticket:", ticket);

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error.message);
    return res.status(500).json({ message: "Failed to fetch ticket" });
  }
};
