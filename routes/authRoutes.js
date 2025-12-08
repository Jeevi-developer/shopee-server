import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
import OTP from "../models/OTP.js";

import { sendOTPEmail } from "../utils/brevoMailService.js";
import { sendOTPSMS } from "../utils/twilioSMS.js";
import { generateReferralCode } from "../utils/generateReferralCode.js"; // adjust path

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
    let { emailOrMobile, password } = req.body;
    if (!emailOrMobile || !password)
      return res
        .status(400)
        .json({ message: "Email/Mobile and Password are required" });

    // Determine query
    let query = {};
    if (emailOrMobile.includes("@")) {
      query = { email: emailOrMobile.toLowerCase().trim() };
    } else {
      let mobile = emailOrMobile.trim();
      if (mobile.startsWith("0")) mobile = mobile.substring(1);
      if (!mobile.startsWith("+91") && mobile.length === 10)
        mobile = "+91" + mobile;
      query = { mobile };
    }

    const customer = await Customer.findOne(query);
    if (!customer)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await customer.comparePassword(password); // ✅ Use schema method
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: customer._id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        mobile: customer.mobile,
        referralCodeUsed: customer.referralCodeUsed, // ← important
        customerOwnCode: customer.customerOwnCode, // ← important
        referredBy: customer.referredBy,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
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
/* ---------------------------------------------------------
   🔐 VERIFY EMAIL OTP → Create Customer
--------------------------------------------------------- */
router.post("/verify-otp", async (req, res) => {
  try {
    let {
      email,
      emailOtp,
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

    if (!email || !emailOtp || !mobile) {
      return res
        .status(400)
        .json({ message: "Email, Mobile & Email OTP are required" });
    }

    // Normalize mobile
    const normalizedMobile = mobile.startsWith("+91") ? mobile : "+91" + mobile;

    // Verify Email OTP
    const emailRecord = await OTP.findOne({ email, otp: String(emailOtp) });
    if (!emailRecord)
      return res.status(401).json({ message: "Invalid Email OTP" });

    // Check if customer exists
    let customer = await Customer.findOne({ email });
    if (!customer) {
      // -------------------------------
      // Determine referral code used
      // -------------------------------
      let usedReferralCode;
      if (referralCode && referralCode.trim() !== "") {
        usedReferralCode = referralCode.trim().toUpperCase();
      } else {
        const admin = await Admin.findOne();
        usedReferralCode = admin?.referralCode || "ADMIN123";
      }

      // Find referrer if referral code exists and is a customer
      const referrer = await Customer.findOne({
        customerOwnCode: usedReferralCode,
      });

      // Generate unique customerOwnCode for this customer
      let customerOwnCode;
      do {
        customerOwnCode = generateReferralCode(name);
      } while (await Customer.findOne({ customerOwnCode }));

      // Create new customer
      customer = new Customer({
        fullName: name,
        email,
        password, // pre-save hook will hash it
        referralCodeUsed: usedReferralCode, // always store the code (default admin if none)
        customerOwnCode,
        mobile: normalizedMobile,
        address,
        city,
        state,
        pincode,
        gender,
        dob,
        agreeToTerms,
        role: "customer",
        referredBy: referrer ? referrer._id : null, // only link if valid customer
      });

      await customer.save();
    }

    // Delete OTPs related to this email
    await OTP.deleteMany({ email });

    res.json({
      message: "OTP verification successful. Registration complete!",
      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        mobile: customer.mobile,
        referralCodeUsed: customer.referralCodeUsed,
        customerOwnCode: customer.customerOwnCode,
        referredBy: customer.referredBy,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

/* ---------------------------------------------------------
   📲 SMS OTP 
--------------------------------------------------------- */
// router.post("/send-sms-otp", async (req, res) => {
//   try {
//     let { mobile } = req.body;

//     mobile = String(mobile).trim();
//     mobile = mobile.startsWith("+91") ? mobile : "+91" + mobile;

//     if (!mobile)
//       return res.status(400).json({ message: "Mobile number required" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     // Delete old OTPs for this mobile
//     await OTP.deleteMany({ mobile });

//     // Save new OTP in DB
//     await OTP.create({
//       mobile,
//       otp,
//       createdAt: new Date(),
//     });

//     // 2Factor.in API
//     const apiKey = process.env.TWO_FACTOR_API_KEY; // your 2Factor.in API key
//     const smsResponse = await axios.get(
//       `https://2factor.in/API/V1/${apiKey}/SMS/+91${mobile}/${otp}`
//     );

//     console.log(`📲 SMS OTP sent to ${mobile}: ${otp}`, smsResponse.data);

//     res.json({
//       message: "SMS OTP sent successfully",
//       otp: process.env.NODE_ENV === "development" ? otp : undefined,
//     });
//   } catch (error) {
//     console.error("❌ Send SMS OTP error:", error);
//     res.status(500).json({ message: "Failed to send SMS OTP" });
//   }
// });

export default router;
