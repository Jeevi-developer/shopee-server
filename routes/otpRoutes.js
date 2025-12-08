import express from "express";
import { sendOTPEmail } from "../utils/brevoMailService.js";

const router = express.Router();

// In-memory OTP storage (for demo; use DB in production)
const otpStore = new Map(); // key: email, value: { otp, expires }

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email, { otp, expires });

  try {
    await sendOTPEmail(email, otp);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const record = otpStore.get(email);

  if (!record) {
    return res.status(400).json({ message: "OTP not found. Please request again." });
  }

  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired. Please request again." });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpStore.delete(email);
  res.json({ message: "OTP verified successfully" });
});

export default router;
