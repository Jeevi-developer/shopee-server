import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";

export const registerSeller = async (req, res) => {
  try {
    console.log("📥 Registration Request:", req.body);

    const {
      firstName,
      lastName,
      email,
      password,
      businessName,
      firmName,
      phone,
      address,
      businessType,
    } = req.body;

    // ✅ Build name and businessName
    const name = `${firstName || ""} ${lastName || ""}`.trim();
    const finalBusinessName = businessName?.trim() || firmName?.trim();

    if (!name || !finalBusinessName) {
      return res.status(400).json({
        success: false,
        message: "Name and Business Name are required",
      });
    }

    // ✅ Check existing seller
    const existingSeller = await Seller.findOne({ email: email.toLowerCase() });
    if (existingSeller) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔒 Hashed Password:", hashedPassword);

    const newSeller = new Seller({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      businessName: finalBusinessName,
      phone,
      address,
      businessType,
    });

    await newSeller.save();

    res.status(201).json({
      success: true,
      message: "Seller registered successfully!",
      seller: newSeller,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if seller exists
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: seller._id, role: "seller" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      seller,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------- FORGOT PASSWORD ----------
export const requestSellerPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    seller.resetPasswordToken = hashedToken;
    seller.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await seller.save();

    const resetURL = `http://localhost:3000/seller/reset-password/${resetToken}`;

    // Nodemailer (you can later replace with Brevo)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Shopee Seller Support" <${process.env.EMAIL_USER}>`,
      to: seller.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${seller.businessName || seller.email},</p>
        <p>You requested a password reset. Click below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>This link expires in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Password reset link sent to email" });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------- RESET PASSWORD ----------
export const resetSellerPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const seller = await Seller.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!seller) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    seller.password = await bcrypt.hash(password, 10);
    seller.resetPasswordToken = undefined;
    seller.resetPasswordExpire = undefined;
    await seller.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
