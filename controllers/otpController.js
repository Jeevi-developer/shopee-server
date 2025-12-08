import { sendOTPEmail } from "../utils/mailer.js"; // your Brevo mailer
import crypto from "crypto";

// Temporary OTP store (replace with DB or Redis in production)
const otpStore = {}; // { email: { code, expires } }

export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore[email] = { code: otp, expires };

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtpController = (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) return res.status(400).json({ message: "OTP not found. Please resend." });
    if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });
    if (otp !== record.code) return res.status(400).json({ message: "Invalid OTP" });

    // OTP verified → remove
    delete otpStore[email];

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
