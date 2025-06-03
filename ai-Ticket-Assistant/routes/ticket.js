import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createTicket, getTickets, getTicket } from "../controller/ticket.js";

const router = express.Router();

router.post("/create", authenticate, createTicket);
router.get("/tickets", authenticate, getTickets);
router.get("/ticket/:id", authenticate, getTicket);

export default router;
