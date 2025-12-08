import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Seller from "../models/Seller.js";
import { sendOTPEmail } from "../utils/brevoMailService.js";

// Helper to save uploaded file paths
const getFilePath = (file) => (file ? file.path.replace(/\\/g, "/") : "");

// Utility function to safely parse JSON
const parseJSON = (value, defaultValue = null) => {
  try {
    return value ? JSON.parse(value) : defaultValue;
  } catch (err) {
    return defaultValue;
  }
};

export const registerSeller = async (req, res) => {
  try {
    // Destructure all fields from req.body
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      referralCode,
      referredBy,
      agreementVersion,
      isAgreementUploaded,
      adminAgreementApproval,
      businessName,
      businessType,
      businessRegNumber,
      taxId,
      businessAddress,
      city,
      state,
      zipCode,
      country,
      natureOfConcern,
      firmName,
      nameAsPerPan,
      hasGst,
      gstNumber,
      gstFile,
      proprietorName,
      proprietorDob,
      proprietorPan,
      proprietorAadhaar,
      proprietorMobile,
      proprietorEmail,
      proprietorAddress,
      numberOfPartners,
      partnershipPan,
      partnershipDeedDate,
      llpName,
      llpRegistrationNo,
      llpPan,
      llpIncorporationDate,
      numberOfDesignatedPartners,
      pvtLtdName,
      cinNumber,
      pvtLtdPan,
      incorporationDate,
      authorizedCapital,
      paidUpCapital,
      numberOfDirectors,
      publicLtdName,
      publicCinNumber,
      publicLtdPan,
      publicIncorporationDate,
      listedStatus,
      stockExchange,
      publicAuthorizedCapital,
      publicPaidUpCapital,
      publicNumberOfDirectors,
      storeName,
      storeDescription,
      storeAddress,
      storeCity,
      storeState,
      storePincode,
      storeCategories,
      bankName,
      accountHolderName,
      accountNumber,
      routingNumber,
      accountType,
      termsAccepted,
      pickupAddress,
      pickupPincode,
      pickupContact,
      branchName,
      ifscCode,
      // add other fields if needed
    } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert booleans
    const isAgreementUploadedBool = isAgreementUploaded === "true";
    const termsAcceptedBool = termsAccepted === "true";

    // Parse JSON arrays/objects
    const parsedAdminApproval = parseJSON(adminAgreementApproval, {
      status: "pending",
    });
    const parsedStoreCategories = parseJSON(storeCategories, []);

    // Handle file uploads if using multer
    const files = req.files || {};
    const seller = new Seller({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth,
      referralCode,
      referredBy,
      agreementVersion,
      isAgreementUploaded: isAgreementUploadedBool,
      adminAgreementApproval: parsedAdminApproval,
      businessName,
      businessType,
      businessRegNumber,
      taxId,
      businessAddress,
      city,
      state,
      zipCode,
      country,
      natureOfConcern,
      firmName,
      nameAsPerPan,
      hasGst,
      gstNumber,
      gstFile: files.gstFile?.filename || "",
      proprietorName,
      proprietorDob,
      proprietorPan,
      proprietorAadhaar,
      proprietorMobile,
      proprietorEmail,
      proprietorAddress,
      proprietorPanCard: files.proprietorPanCard?.filename || "",
      proprietorAadhaarCard: files.proprietorAadhaarCard?.filename || "",
      proprietorPhoto: files.proprietorPhoto?.filename || "",
      numberOfPartners: Number(numberOfPartners) || 0,
      partnershipPan,
      partnershipDeedDate,
      partnershipDeed: files.partnershipDeed?.filename || "",
      llpName,
      llpRegistrationNo,
      llpPan,
      llpIncorporationDate,
      numberOfDesignatedPartners: Number(numberOfDesignatedPartners) || 0,
      llpCertificate: files.llpCertificate?.filename || "",
      llpAgreement: files.llpAgreement?.filename || "",
      pvtLtdName,
      cinNumber,
      pvtLtdPan,
      incorporationDate,
      authorizedCapital,
      paidUpCapital,
      numberOfDirectors: Number(numberOfDirectors) || 0,
      publicLtdName,
      publicCinNumber,
      publicLtdPan,
      publicIncorporationDate,
      listedStatus,
      stockExchange,
      publicAuthorizedCapital,
      publicPaidUpCapital,
      publicNumberOfDirectors: Number(publicNumberOfDirectors) || 0,
      storeName,
      storeDescription,
      storeAddress,
      storeCity,
      storeState,
      storePincode,
      storeLogo: files.storeLogo?.filename || "",
      storeBanner: files.storeBanner?.filename || "",
      storeCategories: parsedStoreCategories,
      bankName,
      accountHolderName,
      accountNumber,
      routingNumber,
      accountType,
      termsAccepted: termsAcceptedBool,
      pickupAddress,
      pickupPincode,
      pickupContact,
      branchName,
      ifscCode,
      // Add any additional fields from multi-step form here
    });

    await seller.save();

    // Generate JWT token
    const token = jwt.sign(
      { sellerId: seller._id, email: seller.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful 🎉",
      token,
      seller,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================================================
    🔵 LOGIN SELLER
   ============================================================ */
// SELLER LOGIN
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res
        .status(400)
        .json({ success: false, message: "Seller not found" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 🚫 Stop login for unapproved sellers
    // if (seller.accountStatus !== "Approved") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Your account is under review. Please wait for admin approval.",
    //   });
    // }

    // DO NOT BLOCK LOGIN — allow login but send status
    const isApproved = seller.accountStatus === "Approved";

    const token = jwt.sign(
      { id: seller._id, role: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: isApproved
        ? "Login successful"
        : "Login successful, but your account is under review.",
      seller,
      token,
      isApproved,
    });
  } catch (err) {
    console.error("Seller Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
    🔵 FORGOT PASSWORD — SEND RESET LINK (BREVO)
   ============================================================ */
export const requestSellerPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    seller.resetPasswordToken = hashedToken;
    seller.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await seller.save();

    const resetURL = `${process.env.CLIENT_BASE_URL}/seller/reset-password/${resetToken}`;

    await sendOTPEmail(
      seller.email,
      `Click below to reset your password:<br><a href="${resetURL}">${resetURL}</a>`
    );

    return res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
    🔵 RESET PASSWORD
   ============================================================ */
export const resetSellerPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const seller = await Seller.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!seller)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    seller.password = await bcrypt.hash(password, 10);
    seller.resetPasswordToken = undefined;
    seller.resetPasswordExpire = undefined;
    await seller.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
