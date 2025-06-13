import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ticket-system",
  eventKey: process.env.INNGEST_EVENT_KEY
});
