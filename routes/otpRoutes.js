import express from "express";
import twilio from "twilio";

const router = express.Router();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Temporary storage (You can use DB instead)
let otpStore = {};

router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    // store OTP in memory
    otpStore[phone] = otp;

    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (otpStore[phone] && otpStore[phone] == otp) {
    delete otpStore[phone]; // optional
    return res.json({ success: true, message: "OTP verified successfully" });
  }

  res
    .status(400)
    .json({ success: false, message: "Invalid OTP or OTP expired" });
});

export default router;
