import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Seller from "../models/Seller.js";
import { sendOTPEmail } from "../utils/brevoMailService.js";

/* ---------- Helpers ---------- */
const parseJSON = (value) => {
  if (!value) return undefined;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const getFile = (files = [], fieldName) => {
  const f = files.find((x) => x.fieldname === fieldName);
  return f ? f.filename : undefined;
};

/* ============================================================
    🔵 REGISTER SELLER — FULL FORM VERSION
   ============================================================ */
export const registerSeller = async (req, res) => {
  try {
    console.log("📥 Seller Registration Body Keys:", Object.keys(req.body));
    console.log("📦 Uploaded files:", req.files?.map((f) => f.fieldname) || []);

    const files = req.files || [];
    const data = req.body;

    if (!data.email || !data.password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const existing = await Seller.findOne({ email: data.email.toLowerCase() });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const seller = new Seller({
      /* Personal Info */
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      password: hashedPassword,
      dateOfBirth: data.dateOfBirth,

      /* Basic Business Info */
      businessName: data.businessName,
      businessType: data.businessType,
      businessRegNumber: data.businessRegNumber,
      taxId: data.taxId,
      businessAddress: data.businessAddress,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,

      /* Tax / GST */
      natureOfConcern: data.natureOfConcern,
      firmName: data.firmName,
      nameAsPerPan: data.nameAsPerPan,
      hasGst: data.hasGst,
      gstNumber: data.gstNumber,
      gstFile: getFile(files, "gstFile"),

      /* Proprietorship */
      proprietorName: data.proprietorName,
      proprietorDob: data.proprietorDob,
      proprietorPan: data.proprietorPan,
      proprietorAadhaar: data.proprietorAadhaar,
      proprietorMobile: data.proprietorMobile,
      proprietorEmail: data.proprietorEmail,
      proprietorAddress: data.proprietorAddress,
      proprietorPanCard: getFile(files, "proprietorPanCard"),
      proprietorAadhaarCard: getFile(files, "proprietorAadhaarCard"),
      proprietorPhoto: getFile(files, "proprietorPhoto"),

      /* Partnership */
      partnershipDeedDate: data.partnershipDeedDate,
      numberOfPartners: data.numberOfPartners
        ? Number(data.numberOfPartners)
        : 0,
      partnershipPan: data.partnershipPan,
      partnershipDeed: getFile(files, "partnershipDeed"),
      partners: parseJSON(data.partners) || [],

      /* LLP */
      llpName: data.llpName,
      llpRegistrationNo: data.llpRegistrationNo,
      llpPan: data.llpPan,
      llpIncorporationDate: data.llpIncorporationDate,
      numberOfDesignatedPartners: data.numberOfDesignatedPartners
        ? Number(data.numberOfDesignatedPartners)
        : 0,
      llpCertificate: getFile(files, "llpCertificate"),
      llpAgreement: getFile(files, "llpAgreement"),
      designatedPartners: parseJSON(data.designatedPartners) || [],

      /* Private Limited */
      pvtLtdName: data.pvtLtdName,
      cinNumber: data.cinNumber,
      pvtLtdPan: data.pvtLtdPan,
      incorporationDate: data.incorporationDate,
      authorizedCapital: data.authorizedCapital,
      paidUpCapital: data.paidUpCapital,
      numberOfDirectors: data.numberOfDirectors
        ? Number(data.numberOfDirectors)
        : 0,
      incorporationCertificate: getFile(files, "incorporationCertificate"),
      moaDocument: getFile(files, "moaDocument"),
      aoaDocument: getFile(files, "aoaDocument"),
      directors: parseJSON(data.directors) || [],

      /* Public Limited */
      publicLtdName: data.publicLtdName,
      publicCinNumber: data.publicCinNumber,
      publicLtdPan: data.publicLtdPan,
      publicIncorporationDate: data.publicIncorporationDate,
      listedStatus: data.listedStatus,
      stockExchange: data.stockExchange,
      publicAuthorizedCapital: data.publicAuthorizedCapital,
      publicPaidUpCapital: data.publicPaidUpCapital,
      publicNumberOfDirectors: data.publicNumberOfDirectors
        ? Number(data.publicNumberOfDirectors)
        : 0,
      publicIncorporationCertificate: getFile(
        files,
        "publicIncorporationCertificate"
      ),
      publicMoaDocument: getFile(files, "publicMoaDocument"),
      publicAoaDocument: getFile(files, "publicAoaDocument"),
      publicDirectors: parseJSON(data.publicDirectors) || [],

      /* Store Details */
      gstin: data.gstin,
      pan: data.pan,
      storeName: data.storeName,
      storeDescription: data.storeDescription,
      storeAddress: data.storeAddress,
      storeCity: data.storeCity,
      storeState: data.storeState,
      storePincode: data.storePincode,
      storeCategories: parseJSON(data.storeCategories) || [],
      storeLogo: getFile(files, "storeLogo"),
      storeBanner: getFile(files, "storeBanner"),

      /* Pickup */
      pickupAddress: data.pickupAddress,
      pickupPincode: data.pickupPincode,
      pickupContact: data.pickupContact,
      esignature: getFile(files, "esignature"),
      addressProof: getFile(files, "addressProof"),
      photoId: getFile(files, "photoId"),

      /* Business Docs */
      businessLicense: getFile(files, "businessLicense"),
      taxCertificate: getFile(files, "taxCertificate"),
      identityProof: getFile(files, "identityProof"),

      /* Bank Info */
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      accountNumber: data.accountNumber,
      routingNumber: data.routingNumber,
      accountType: data.accountType,

      termsAccepted:
        data.termsAccepted === "true" || data.termsAccepted === true,
    });

    await seller.save();

    const responseSeller = seller.toObject();
    delete responseSeller.password;

    return res.status(201).json({
      success: true,
      message: "Seller registered successfully!",
      seller: responseSeller,
    });
  } catch (err) {
    console.error("❌ registerSeller Error:", err);
    return res.status(500).json({ success: false, message: err.message });
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
