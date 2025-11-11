import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // ✅ for signing tokens
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "../utils/brevoMailService.js";

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const generateToken = (id, type) =>
  jwt.sign({ id, type }, JWT_SECRET, { expiresIn: "30d" });

router.post("/login", async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res
        .status(400)
        .json({ message: "Email/mobile and password required" });
    }

    let user = null;
    let role = "";

    // 1️⃣ Try Admin
    user = await Admin.findOne({ email: emailOrMobile.toLowerCase() });
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid)
        return res.status(401).json({ message: "Invalid credentials" });
      role = "admin";
    }

    // 2️⃣ Try Seller
    if (!user) {
      user = await Seller.findOne({ email: emailOrMobile.toLowerCase() });
      if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
          return res.status(401).json({ message: "Invalid credentials" });
        role = "seller";
      }
    }

    // 3️⃣ Try Customer
    if (!user) {
      user = await Customer.findOne({
        $or: [
          { email: emailOrMobile.toLowerCase() },
          { mobile: emailOrMobile },
        ],
      });
      if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
          return res.status(401).json({ message: "Invalid credentials" });
        role = "customer";
      }
    }

    // ❌ If no user found
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate Token
    const token = generateToken(user._id, role);

    // Return user info
    res.json({
      message: `${role} login successful`,
      token,
      user: {
        id: user._id,
        name: user.name || user.businessName,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Send OTP using Brevo
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    // ✅ Send via Brevo
    await sendOTPEmail(email, otp);

    console.log(`✅ OTP for ${email}: ${otp}`);
    res.json({
      message: "OTP sent successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (err) {
    console.error("❌ Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, name, password, referralCode } = req.body;

    console.log("Verifying OTP for:", email, otp);
    const otpRecord = await OTP.findOne({ email, otp });
    console.log("Found OTP Record:", otpRecord);

    if (!otpRecord)
      return res.status(401).json({ message: "Invalid or expired OTP" });

    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = new Customer({
        name,
        email,
        password,
        referralCode,
        role: "customer",
      });
      await customer.save();
    }

    await OTP.deleteOne({ _id: otpRecord._id });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
