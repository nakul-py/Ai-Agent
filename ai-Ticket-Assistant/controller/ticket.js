import { inngest } from "../inngest/client.js";
import ticket from "../models/ticket.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = res.body;
    if(!title || !description) {
        return res.status(400).json({ message: "Title and description are required." });
    }
    const newTicket = Ticket.create({
        title,
        description,
        createdBy: req.user._id.toString()
    })
    
    await inngest.send({
        name: "ticket/created",
        data: {
            ticketId: (await newTicket)._id.toString(),
            title,
            description,
            createdBy: req.user._id.toString()
        }
    });
    return res.status(201).json({
        message: "Ticket created successfully and process initiated.",
        ticket: newTicket
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ message: "Failed to create ticket", error: error.message });
  }
};
