import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
import OTP from "../models/OTP.js";

import { sendOTPEmail } from "../utils/brevoMailService.js";
import { sendOTPSMS } from "../utils/twilioSMS.js";

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const generateToken = (id, type) =>
  jwt.sign({ id, type }, JWT_SECRET, { expiresIn: "30d" });

/* ---------------------------------------------------------
   🔐 LOGIN (Admin → Seller → Customer)
--------------------------------------------------------- */
// ======================
// CUSTOMER LOGIN ROUTE
// ======================

router.post("/login", async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    console.log("📥 Incoming Login Request:", req.body);

    if (!emailOrMobile || !password) {
      return res
        .status(400)
        .json({ message: "Email/Mobile and Password are required" });
    }

    let query = {};

    // -------------------------------
    // 1️⃣ CHECK IF USER IS USING EMAIL
    // -------------------------------
    if (emailOrMobile.includes("@")) {
      query = { email: emailOrMobile.toLowerCase() };
      console.log("🔍 Login Using Email:", query);
    }

    // -------------------------------
    // 2️⃣ ELSE, TREAT AS MOBILE NUMBER
    // -------------------------------
    else {
      let mobile = emailOrMobile;

      // Remove leading 0 → "0987654321" → "987654321"
      if (mobile.startsWith("0")) {
        mobile = mobile.substring(1);
      }

      // Normalize Indian numbers (10 digits → add +91)
      if (!mobile.startsWith("+91") && mobile.length === 10) {
        mobile = "+91" + mobile;
      }

      query = { mobile };
      console.log("🔍 Login Using Mobile:", query);
    }

    // -------------------------------
    // 3️⃣ FIND USER
    // -------------------------------
    const user = await Customer.findOne(query);

    if (!user) {
      console.log("❌ No user found for query:", query);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ User Found:", user.email || user.mobile);

    // -------------------------------
    // 4️⃣ PASSWORD CHECK
    // -------------------------------
    console.log("🔑 Comparing Passwords...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ Password matched!");

    // -------------------------------
    // 5️⃣ CREATE JWT TOKEN
    // -------------------------------
    const token = jwt.sign(
      { id: user._id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("🎉 LOGIN SUCCESS!");

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error("🔥 Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ---------------------------------------------------------
   📧 EMAIL OTP
--------------------------------------------------------- */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

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

/* ---------------------------------------------------------
   🔐 VERIFY EMAIL + SMS OTP → Create Customer
--------------------------------------------------------- */
router.post("/verify-otp", async (req, res) => {
  try {
    // Extract all fields ONCE
    let {
      email,
      emailOtp,
      smsOtp,
      name,
      password,
      referralCode,
      mobile,
      address,
      city,
      state,
      pincode,
      gender,
      dob,
      agreeToTerms,
    } = req.body;

    // Validation
    if (!email || !emailOtp || !smsOtp || !mobile) {
      return res
        .status(400)
        .json({ message: "Email, Mobile & both OTPs are required" });
    }

    // Normalize mobile
    mobile = String(mobile).trim();
    const normalizedMobile = mobile.startsWith("+91") ? mobile : "+91" + mobile;

    // Check email OTP
    const emailRecord = await OTP.findOne({
      email,
      otp: String(emailOtp),
    });

    if (!emailRecord) {
      return res.status(401).json({ message: "Invalid Email OTP" });
    }

    // Check SMS OTP
    const smsRecord = await OTP.findOne({
      mobile: normalizedMobile,
      otp: String(smsOtp),
    });

    if (!smsRecord) {
      return res.status(401).json({ message: "Invalid SMS OTP" });
    }

    // Check if customer exists
    let customer = await Customer.findOne({ email });

    // Create if not exists
    if (!customer) {
      // const hashedPassword = await bcrypt.hash(password, 10);

      customer = new Customer({
        fullName: name,
        email,
        password,
        referralCode,
        mobile: normalizedMobile,
        address,
        city,
        state,
        pincode,
        gender,
        dob,
        agreeToTerms,
        role: "customer",
      });

      await customer.save();
    }

    // Delete OTPs
    await OTP.deleteMany({
      $or: [{ email }, { mobile: normalizedMobile }],
    });

    res.json({ message: "OTP verification successful" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ---------------------------------------------------------
   📲 SMS OTP 
--------------------------------------------------------- */
router.post("/send-sms-otp", async (req, res) => {
  try {
    let { mobile } = req.body;

    // FIX: FORCE STRING
    mobile = String(mobile).trim();

    // Convert mobile to +91 format
    mobile = mobile.startsWith("+91") ? mobile : "+91" + mobile;

    if (!mobile)
      return res.status(400).json({ message: "Mobile number required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ mobile });

    await OTP.create({
      mobile,
      otp,
      createdAt: new Date(),
    });

    await sendOTPSMS(mobile, otp);

    console.log(`📲 SMS OTP sent to ${mobile}: ${otp}`);

    res.json({
      message: "SMS OTP sent successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("❌ Send SMS OTP error:", error);
    res.status(500).json({ message: "Failed to send SMS OTP" });
  }
});

export default router;
