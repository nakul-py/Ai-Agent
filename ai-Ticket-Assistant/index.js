import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { serve } from "inngest/express";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import { inngest } from "./inngest/client.js";
import { onTicketCreation } from "./inngest/functions/on-ticket-creation.js";
import { onUserSignUp } from "./inngest/functions/on-signUP.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors(
  {origin: "http://localhost:5173",
  credentials: true}
));
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onTicketCreation, onUserSignUp],
  })
);

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
