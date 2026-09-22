import nodemailer from "nodemailer";
import { pool } from "../config/postgresdb.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    if (pool) {
      await pool.query(
        `INSERT INTO newsletters (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
        [email]
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || '"CareerCraft AI" <no-reply@careercraft.ai>',
      to: email,
      subject: "Welcome to CareerCraft AI Resume Builder",
      text: "Welcome to CareerCraft AI Resume Builder!\nCongratulations! You have signed up for CareerCraft AI Resume Builder.\n\nWe are excited to help you empower your skills and build your dream career.\n\nBest Regards,\nThe CareerCraft AI Team",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <div style="margin: 0 auto 20px auto; text-align: center;">
             <img src="cid:careerCraftLogo" alt="CareerCraft AI Logo" style="width: 200px; height: auto;" />
          </div>
          <h2 style="color: #1a2e52;">Welcome to CareerCraft AI Resume Builder!</h2>
          <p style="font-size: 16px; color: #333;"><strong>Congratulations! You have signed up for CareerCraft AI Resume Builder.</strong></p>
          <p style="font-size: 14px; color: #555;">We are excited to help you empower your skills and build your dream career.</p>
          <br/>
          <p style="font-size: 14px; color: #777;">Best Regards,<br/><strong>The CareerCraft AI Team</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: 'careercraft_logo.png',
          path: path.resolve(__dirname, "../../frontend/src/assets/careercraft_logo.png"),
          cid: 'careerCraftLogo'
        }
      ]
    };

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Email credentials missing in .env (EMAIL_USER, EMAIL_PASS). Email not actually sent.");
      return res.status(200).json({ message: "Subscription logic triggered, but email credentials missing." });
    }

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Subscription successful, email sent!" });
    } catch (emailError) {
      console.error("⚠️ Email failed to send (likely invalid app password in .env):", emailError.message);
      // We still return 200 because the user's email was successfully stored in the database
      res.status(200).json({ message: "Subscription saved to database, but welcome email failed to send." });
    }

  } catch (error) {
    console.error("Error sending newsletter email:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message, stack: error.stack });
  }
};
