import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description , priority, assignedTo, deadline, relatedSkills, helpfulNotes} = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
      assignedTo,
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: ( newTicket)._id.toString(),
        title,
        description,
        status: "TODO",
        priority: priority || "Low",
        assignedTo: assignedTo || null,
        deadline: deadline || null,
        relatedSkills: relatedSkills || [],
        helpfulNotes: helpfulNotes || "",
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
        .populate("assignedTo", ["email", "username"])
        .select("title description status assignedTo priority helpfulNotes relatedSkills createdAt")
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .populate("assignedTo", ["email", "username"])
        .select("title description status assignedTo priority helpfulNotes  relatedSkills createdAt")
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
      }).select("title description status assignedTo priority helpfulNotes relatedSkills createdAt")
        .populate("assignedTo", ["email", "username"]);
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

export const deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const user = req.user;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    if (user.role !== "admin" && user.role !== "moderator" && ticket.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this ticket." });
    }

    await Ticket.findByIdAndDelete(ticketId);

    await inngest.send({
      name: "ticket/deleted",
      data: { ticketId },
    });

    return res.status(200).json({ message: "Ticket deleted successfully." });
  } catch (error) {
    console.error("Error deleting ticket:", error.message);
    return res.status(500).json({ message: "Failed to delete ticket.", error: error.message });
  }
};
