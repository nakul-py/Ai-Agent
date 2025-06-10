import Ticket from "../../models/ticket.js";
import { sendMail } from "../../libs/mailer.js";
import { inngest } from "../../inngest/client.js";

export const onTicketDeletion = inngest.createFunction(
  "On Ticket Deletion",
  { event: "ticket/deleted" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      const ticket = await Ticket.findById(ticketId).populate("assignedTo");
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      if (ticket.assignedTo) {
        await step.run("notify-assigned-user", async () => {
          await sendMail(
            ticket.assignedTo.email,
            "Ticket Deleted",
            `The ticket titled "${ticket.title}" has been deleted.`
          );
        });
      }

      await step.run("notify-moderator", async () => {
        const moderator = await User.findOne({ role: "moderator" });
        if (moderator) {
          await sendMail(
            moderator.email,
            "Ticket Deleted",
            `The ticket titled "${ticket.title}" has been deleted.`
          );
        }
      });

      await step.run("delete-ticket", async () => {
        await Ticket.findByIdAndDelete(ticketId);
      });

      return { success: true };
    } catch (error) {
      console.log(" ❌ Ticket has been deletd", error.message);
      return {
        success: false,
        error:
          error.message ||
          "An error occurred while processing the ticket deletion.",
      };
    }
  }
);
