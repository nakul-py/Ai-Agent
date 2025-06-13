import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { serve } from "inngest/express";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import { inngest } from "./inngest/client.js";
import { onTicketCreation } from "./inngest/functions/on-ticket-creation.js";
import { onUserSignUp } from "./inngest/functions/on-signUP.js";
import { onTicketDeletion } from "./inngest/functions/on-ticket-deletion.js";
import User from "./models/user.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({ origin: "https://ai-agent-frontend-nakul-vermas-projects-afed9051.vercel.app", credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Backend is up and running! 🚀 ");
});

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onTicketCreation, onUserSignUp, onTicketDeletion],
  })
);

app.delete("/tickets/:id", async (req, res) => {
  onTicketDeletion(req, res, inngest);
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
});
console.log("Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected successfully ✅");
    app.listen(PORT, () =>
      console.log(`Server is running at http://localhost:${PORT} 🚀`)
    );
  })
  .catch((err) => console.error("❗❗MongoDB connection error :", err));
