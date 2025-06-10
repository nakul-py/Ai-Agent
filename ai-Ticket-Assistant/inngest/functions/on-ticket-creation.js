import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../libs/mailer.js";
import Ticket from "../../models/ticket.js";
import { analyzeTicket } from "../../libs/ticket-ai.js";

export const onTicketCreation = inngest.createFunction(
  { id: "on-ticket-creation", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // Fetch the ticket details from the database
      const ticket = await step.run("get-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError(
            `Ticket with ID ${ticketId} does not exist.`
          );
        }
        return ticketObject;
      });

      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      const aiResponse = await analyzeTicket(ticket);

      // console.log("🧠 AI response:", aiResponse);

      const relatedSkills = await step.run("ai-processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });
          skills = aiResponse.relatedSkills;
        } else {
          console.log("❌ AI response missing or empty");
        }
        return skills;
      });

      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedSkills.join("|"),
              $options: "i",
            },
          },
        });

        if (!user) {
          user = await User.findOne({
            role: "moderator",
          });
        }

        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }

        if (user) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            assignedTo: user._id || null,
          });
        } else {
          console.log("❌ No moderator or admin found to assign the ticket.");
        }

        return user;
      });

      await step.run("send-email-notificaton", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendMail(
            moderator.email,
            "New Ticket Assigned",
            `A new ticket has been assigned to ${finalTicket.title}.`
          );
        }
      });

      return { success: true };
    } catch (error) {
      console.log(" ❌ Error in onTicketCreation:", error.message);
      return {
        success: false,
        error:
          error.message || "An error occurred while processing the ticket.",
      };
    }
  }
);
