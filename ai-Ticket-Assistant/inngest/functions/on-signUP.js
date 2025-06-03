import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../libs/mailer.js";

export const onUserSignUp = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user.signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError(
            `User with email ${email} does not exist or could not be retrieved.`
          );
        }
        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to Our Service!`;
        const message = `Hello, ${email}! 
                \n\n
                Thank you for signing up. We're excited to have you on board!`;

        try {
          await sendMail(user.email, subject, message);
        } catch (mailError) {
          console.error("❗❗Error sending welcome email:", mailError.message);
          throw mailError;
        }
      });

      return { success: true };
    } catch (error) {
      console.error("❗❗Error in onUserSignUp function:", error.message);
      return { success: false };
    }
  }
);
