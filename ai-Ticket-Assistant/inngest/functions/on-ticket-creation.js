import { inngest } from "../client";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../libs/mailer.js";
import { Ticket } from "../../models/ticket.js";
import { analyzeTicket } from "../../libs/ticket-ai.js";

export const onTicketCreation = inngest.createFunction(
  { id: "on-ticket-creation", retries: 2 },
  { event: "ticket.creation" },
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
        return ticket;
      });

      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      const aiResponse = await analyzeTicket(ticket);

      await step.run("ai-processing", async () => {
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
          skills = aiResponse.relatedSkills
            ? aiResponse.relatedSkills
            : ["python", "javascript"];
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
            role: "admin",
          });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user._id || null,
        });
        return user;
      });

      await step.run("send-email-notificaton", async () => {
        if (moderator) {
          const finalTicket = await sendMail(
            moderator.email,
            "New Ticket Assigned",
            `A new ticket has been assigned to ${finalTicket.title}.`
          );
        }
      });

      return { success: true, ticketId: ticket._id };
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
