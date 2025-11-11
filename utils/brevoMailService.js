import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const sendOTPEmail = async (email, otp) => {
  try {
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
      throw new Error("Missing BREVO_API_KEY or BREVO_SENDER_EMAIL in environment variables");
    }

    console.log("📨 Sending OTP email...");
    console.log("🔑 Brevo API key (first 10):", process.env.BREVO_API_KEY.slice(0, 10));
    console.log("📧 Sending from:", process.env.BREVO_SENDER_EMAIL, "→ To:", email);

    const payload = {
      sender: {
        name: "INDXIND SHOPEE",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email }],
      subject: "Your INDXIND SHOPEE OTP Code",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 10px;">
          <h2>Verification Code</h2>
          <p>Your OTP code is:</p>
          <h1 style="color:#008060;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
      }
    );

    console.log(`✅ OTP email sent successfully to ${email}`);
    return response.data;
  } catch (error) {
    console.error("❌ Brevo API Error:");
    console.error(error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to send email via Brevo");
  }
};
