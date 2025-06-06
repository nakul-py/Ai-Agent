import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createTicket, getTickets, getTicket, deleteTicket } from "../controller/ticket.js";

const router = express.Router();

router.post("/", authenticate, createTicket);
router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.delete("/:id", authenticate, deleteTicket);

export default router;
