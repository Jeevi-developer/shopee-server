import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
import authenticateToken from "../middleware/authenticateToken.js";
import { generateReferralCode } from "../utils/generateReferralCode.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
// ==================== Registration Endpoint ====================
router.post(
  "/register",
  upload.any(), // ⬅️ Supports text + files
  async (req, res) => {
    try {
      console.log("📩 Incoming Body:", req.body);
      console.log("📎 Uploaded Files:", req.files);

      const {
        firstName,
        lastName,
        email,
        password,
        businessName,
        firmName,
        phone,
        businessType,
        referralCode, // optional
      } = req.body;

      if (!firstName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "First name, email & password are required.",
        });
      }

      const finalBusinessName = businessName || firmName || "";
      if (!finalBusinessName) {
        return res.status(400).json({
          success: false,
          message: "Business Name / Firm Name required",
        });
      }

      // Check email existence
      const existingSeller = await Seller.findOne({
        email: email.toLowerCase(),
      });
      if (existingSeller) {
        return res
          .status(409)
          .json({ success: false, message: "Email already registered." });
      }

      let referredBy = "";

      // Validate referral code if provided
      if (referralCode) {
        const refExists =
          (await Seller.findOne({ referralCode })) ||
          (await Admin.findOne({ referralCode }));

        if (!refExists) {
          return res.status(400).json({
            success: false,
            message: "Invalid referral code",
          });
        }
        referredBy = referralCode;
      } else {
        // If not provided — assign Admin default referral
        const admin = await Admin.findOne();
        referredBy = admin?.referralCode || "ADMIN-REF-1001";
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Extract files
      const storeLogo =
        req.files.find((f) => f.fieldname === "storeLogo")?.originalname || "";
      const storeBanner =
        req.files.find((f) => f.fieldname === "storeBanner")?.originalname ||
        "";
      const gstFile =
        req.files.find((f) => f.fieldname === "gstFile")?.originalname || "";

      const newSeller = new Seller({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        businessName: finalBusinessName,
        businessType,
        password: hashedPassword,

        referredBy,
        referralCode: generateReferralCode(),

        storeLogo,
        storeBanner,
        gstFile,
      });

      await newSeller.save();

      // 🔐 Generate JWT Token
      const token = jwt.sign(
        { sellerId: newSeller._id.toString(), email: newSeller.email },
        process.env.JWT_SECRET || "your-secret-change",
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        success: true,
        message: "Registration successful 🎉",
        token,
        seller: newSeller,
      });
    } catch (error) {
      console.error("❌ Registration Error:", error);

      if (error.code === 11000 && error.keyPattern?.referralCode) {
        return res.status(400).json({
          success: false,
          message: "Referral code already exists. Try again",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error. Try again later.",
      });
    }
  }
);

// ==================== Login Endpoint ====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    if (!(await bcrypt.compare(password, seller.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { sellerId: seller._id.toString(), email: seller.email },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      seller,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
});

// ==================== Get Seller Profile ====================
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.sellerId).select("-password");
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    res.json({ success: true, seller });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
});

// ==================== Update Seller Profile ====================
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.email;
    delete updates._id;
    updates.updatedAt = new Date();

    const seller = await Seller.findByIdAndUpdate(req.user.sellerId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    res.json({
      success: true,
      message: "Profile updated successfully",
      seller,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
});

export default router;
