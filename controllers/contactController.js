// controllers/contactController.js
import ContactMessage from "../models/ContactMessage.js";
import { sendContactMail } from "../utils/sendContactMail.js";

// POST /api/contact/send
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    // 2️⃣ Save message to MongoDB
    const savedMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    // 3️⃣ Send emails via Brevo
    const emailResult = await sendContactMail({ name, email, phone, subject, message });

    // 4️⃣ Respond to frontend
    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: "Message sent successfully! An acknowledgment email has been sent to your inbox.",
        emailResult,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Message saved, but failed to send emails.",
        error: emailResult.error,
      });
    }
  } catch (error) {
    console.error("Error in sendContactMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};
