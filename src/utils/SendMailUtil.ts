import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Define the shape of the email options
interface EmailOptions {
  email: string;    // Receiver's email
  subject: string;  // Email subject
  message: string;  // Plain text body
  html?: string;    // Optional HTML body
}

export class SendMailUtil {
  
  // Create the transporter once (reuse it for better performance)
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // Optional: useful for debugging connection issues
    // logger: true, 
    // debug: true, 
  });

  /**
   * Sends an email using the configured transporter.
   * @param options - The email details (to, subject, message)
   */
  public static async send(options: EmailOptions): Promise<void> {
    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // If you provide HTML, Nodemailer uses it automatically
    };

    try {
      const info = await this.transporter.sendMail(message);
      console.log(`Message sent: ${info.messageId}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Email could not be sent");
    }
  }
}