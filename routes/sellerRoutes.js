import express from "express";
import Seller from "../models/Seller.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  loginSeller,
  requestSellerPasswordReset,
  resetSellerPassword,
} from "../controllers/sellerController.js";

const router = express.Router();

// ✅ CREATE UPLOADS DIRECTORY IF IT DOESN'T EXIST
const uploadsDir = "./uploads/sellers";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ DISK STORAGE (NOT MEMORY STORAGE)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ✅ ALL FILE FIELDS
const cpUpload = upload.fields([
  { name: "gstFile", maxCount: 1 },
  { name: "proprietorPanCard", maxCount: 1 },
  { name: "proprietorAadhaarCard", maxCount: 1 },
  { name: "proprietorPhoto", maxCount: 1 },
  { name: "partnershipDeed", maxCount: 1 },
  { name: "llpCertificate", maxCount: 1 },
  { name: "llpAgreement", maxCount: 1 },
  { name: "incorporationCertificate", maxCount: 1 },
  { name: "moaDocument", maxCount: 1 },
  { name: "aoaDocument", maxCount: 1 },
  { name: "publicIncorporationCertificate", maxCount: 1 },
  { name: "publicMoaDocument", maxCount: 1 },
  { name: "publicAoaDocument", maxCount: 1 },
  { name: "storeLogo", maxCount: 1 },
  { name: "storeBanner", maxCount: 1 },
  { name: "esignature", maxCount: 1 },
  { name: "addressProof", maxCount: 1 },
  { name: "photoId", maxCount: 1 },
  { name: "businessLicense", maxCount: 1 },
  { name: "taxCertificate", maxCount: 1 },
  { name: "identityProof", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "signedAgreement", maxCount: 1 },
]);

// ✅ UTILITY: PARSE JSON SAFELY
const parseJSON = (value, defaultValue) => {
  try {
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// ✅ UTILITY: GET FILE PATH
const getFilePath = (files, fieldName) => {
  return files[fieldName]?.[0]?.path || "";
};

// ✅ REGISTRATION ROUTE
router.post("/register", cpUpload, async (req, res) => {
  try {
    console.log("📦 Full Request Body:", JSON.stringify(req.body, null, 2));
    console.log("📁 Files:", JSON.stringify(req.files, null, 2));
    const body = req.body;
    const files = req.files || {};

    // ✅ VALIDATE REQUIRED FIELDS
    if (!body.firstName || !body.email || !body.password) {
      return res.status(400).json({
        success: false,
        message: "First name, email, and password are required",
      });
    }

    // ✅ CHECK IF EMAIL EXISTS
    const existingSeller = await Seller.findOne({ email: body.email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // ✅ PARSE BOOLEANS
    const isAgreementUploaded =
      !!files.signedAgreement || body.isAgreementUploaded === "true";
    const termsAccepted = body.termsAccepted === "true";

    // ✅ PARSE NUMBERS
    const numberOfPartners = parseInt(body.numberOfPartners) || 0;
    const numberOfDirectors = parseInt(body.numberOfDirectors) || 0;
    const numberOfDesignatedPartners =
      parseInt(body.numberOfDesignatedPartners) || 0;
    const publicNumberOfDirectors = parseInt(body.publicNumberOfDirectors) || 0;

    // ✅ PARSE ARRAYS/OBJECTS
    const storeCategories = parseJSON(body.storeCategories, []);
    const partners = parseJSON(body.partners, []);
    const designatedPartners = parseJSON(body.designatedPartners, []);
    const directors = parseJSON(body.directors, []);
    const publicDirectors = parseJSON(body.publicDirectors, []);
    const adminAgreementApproval = parseJSON(body.adminAgreementApproval, {
      status: "pending",
    });

    // ✅ CREATE SELLER DATA (EXPLICIT MAPPING - NO SPREAD)
    const sellerData = {
      // Personal Info
      firstName: body.firstName,
      lastName: body.lastName || "",
      email: body.email,
      password: hashedPassword,
      phone: body.phone || "",
      dateOfBirth: body.dateOfBirth || "",
      referralCode: body.referralCode || "",
      referredBy: body.referredBy || "",

      // Agreement
      agreementVersion: body.agreementVersion || "v1.0",
      isAgreementUploaded,
      adminAgreementApproval,
      signedAgreementURL: getFilePath(files, "signedAgreement"),

      // Business Info
      businessName: body.businessName || "",
      businessType: body.businessType || "",
      businessRegNumber: body.businessRegNumber || "",
      taxId: body.taxId || "",
      businessAddress: body.businessAddress || "",
      city: body.city || "",
      state: body.state || "",
      zipCode: body.zipCode || "",
      country: body.country || "",

      // Firm Details
      natureOfConcern: body.natureOfConcern || "",
      firmName: body.firmName || "",
      nameAsPerPan: body.nameAsPerPan || "",
      hasGst: body.hasGst || "",
      gstNumber: body.gstNumber || "",
      gstFile: getFilePath(files, "gstFile"),

      // Proprietorship
      proprietorName: body.proprietorName || "",
      proprietorDob: body.proprietorDob || "",
      proprietorPan: body.proprietorPan || "",
      proprietorAadhaar: body.proprietorAadhaar || "",
      proprietorMobile: body.proprietorMobile || "",
      proprietorEmail: body.proprietorEmail || "",
      proprietorAddress: body.proprietorAddress || "",
      proprietorPanCard: getFilePath(files, "proprietorPanCard"),
      proprietorAadhaarCard: getFilePath(files, "proprietorAadhaarCard"),
      proprietorPhoto: getFilePath(files, "proprietorPhoto"),

      // Partnership
      partnershipDeedDate: body.partnershipDeedDate || "",
      numberOfPartners,
      partnershipPan: body.partnershipPan || "",
      partnershipDeed: getFilePath(files, "partnershipDeed"),
      partners,

      // LLP
      llpName: body.llpName || "",
      llpRegistrationNo: body.llpRegistrationNo || "",
      llpPan: body.llpPan || "",
      llpIncorporationDate: body.llpIncorporationDate || "",
      numberOfDesignatedPartners,
      llpCertificate: getFilePath(files, "llpCertificate"),
      llpAgreement: getFilePath(files, "llpAgreement"),
      designatedPartners,

      // Private Limited
      pvtLtdName: body.pvtLtdName || "",
      cinNumber: body.cinNumber || "",
      pvtLtdPan: body.pvtLtdPan || "",
      incorporationDate: body.incorporationDate || "",
      authorizedCapital: body.authorizedCapital || "",
      paidUpCapital: body.paidUpCapital || "",
      numberOfDirectors,
      incorporationCertificate: getFilePath(files, "incorporationCertificate"),
      moaDocument: getFilePath(files, "moaDocument"),
      aoaDocument: getFilePath(files, "aoaDocument"),
      directors,

      // Public Limited
      publicLtdName: body.publicLtdName || "",
      publicCinNumber: body.publicCinNumber || "",
      publicLtdPan: body.publicLtdPan || "",
      publicIncorporationDate: body.publicIncorporationDate || "",
      listedStatus: body.listedStatus || "NO",
      stockExchange: body.stockExchange || "",
      publicAuthorizedCapital: body.publicAuthorizedCapital || "",
      publicPaidUpCapital: body.publicPaidUpCapital || "",
      publicNumberOfDirectors,
      publicIncorporationCertificate: getFilePath(
        files,
        "publicIncorporationCertificate"
      ),
      publicMoaDocument: getFilePath(files, "publicMoaDocument"),
      publicAoaDocument: getFilePath(files, "publicAoaDocument"),
      publicDirectors,

      // Store Setup
      gstin: body.gstin || "",
      pan: body.pan || "",
      storeName: body.storeName || "",
      storeDescription: body.storeDescription || "",
      storeAddress: body.storeAddress || "",
      storeCity: body.storeCity || "",
      storeState: body.storeState || "",
      storePincode: body.storePincode || "",
      storeCategories,
      storeLogo: getFilePath(files, "storeLogo"),
      storeBanner: getFilePath(files, "storeBanner"),

      // Pickup Details
      pickupAddress: body.pickupAddress || "",
      pickupPincode: body.pickupPincode || "",
      pickupContact: body.pickupContact || "",
      esignature: getFilePath(files, "esignature"),
      addressProof: getFilePath(files, "addressProof"),
      photoId: getFilePath(files, "photoId"),

      // Business Documents
      businessLicense: getFilePath(files, "businessLicense"),
      taxCertificate: getFilePath(files, "taxCertificate"),
      identityProof: getFilePath(files, "identityProof"),

      // Bank Details
      bankName: body.bankName || "",
      accountHolderName: body.accountHolderName || "",
      accountNumber: body.accountNumber || "",
      routingNumber: body.routingNumber || "",
      accountType: body.accountType || "",
      branchName: body.branchName || "",
      ifscCode: body.ifscCode || "",

      // Terms
      termsAccepted,

      // Status
      status: "pending",
      approvalReason: "",
      statusReason: "",
    };

    // ✅ CREATE SELLER
    const seller = new Seller(sellerData);
    const savedSeller = await seller.save();

    console.log("✅ Seller created:", savedSeller._id);

    // ✅ GENERATE JWT
    const token = jwt.sign(
      { sellerId: savedSeller._id, email: savedSeller.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful 🎉",
      token,
      seller: savedSeller,
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ✅ AUTH ROUTES
router.post("/login", loginSeller);
router.post("/forgot-password", requestSellerPasswordReset);
router.post("/reset-password/:token", resetSellerPassword);

// ✅ GET SELLER BY ID
router.get("/:id", async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }
    res.json(seller);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;
