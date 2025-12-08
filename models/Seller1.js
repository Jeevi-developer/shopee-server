import mongoose from "mongoose";

// ==============================
// Sub-schemas
// ==============================
const PartnerSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    panNo: { type: String, default: "" },
    share: { type: String, default: "" },
    address: { type: String, default: "" },
    mobile: { type: String, default: "" },
  },
  { _id: false }
);

const DirectorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    dinNo: { type: String, default: "" },
    panNo: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { _id: false }
);

const StoreCategorySchema = new mongoose.Schema(
  {
    category: { type: String, default: "" },
    customCategory: { type: String, default: "" },
  },
  { _id: false }
);

// ==============================
// Seller Schema
// ==============================
const SellerSchema = new mongoose.Schema(
  {
    // Step 1: Personal Info
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: { type: String, unique: true, required: true },
    password: { type: String, default: "" },
    phone: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    referralCode: { type: String, unique: true, default: "" },
    referredBy: { type: String, default: "" },

    agreementVersion: {
      type: String,
      default: "v1.0",
    },
    signedAgreementURL: {
      type: String,
    },
    isAgreementUploaded: {
      type: Boolean,
      default: false,
    },
    adminAgreementApproval: {
      status: {
        type: String,
        default: "pending", // pending | approved | rejected
      },
      reviewedBy: String,
      reviewedAt: Date,
      remarks: String,
    },
    agreementUploadedAt: Date,

    // Step 2: Business Info
    businessName: { type: String, default: "" },
    businessType: { type: String, default: "" },
    businessRegNumber: { type: String, default: "" },
    taxId: { type: String, default: "" },
    businessAddress: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "" },

    natureOfConcern: { type: String, default: "" },
    firmName: { type: String, default: "" },
    nameAsPerPan: { type: String, default: "" },
    hasGst: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    gstFile: { type: String, default: "" },

    // Proprietorship
    proprietorName: { type: String, default: "" },
    proprietorDob: { type: String, default: "" },
    proprietorPan: { type: String, default: "" },
    proprietorAadhaar: { type: String, default: "" },
    proprietorMobile: { type: String, default: "" },
    proprietorEmail: { type: String, default: "" },
    proprietorAddress: { type: String, default: "" },
    proprietorPanCard: { type: String, default: "" },
    proprietorAadhaarCard: { type: String, default: "" },
    proprietorPhoto: { type: String, default: "" },

    // Partnership
    partnershipDeedDate: { type: String, default: "" },
    numberOfPartners: { type: Number, default: 0 },
    partnershipPan: { type: String, default: "" },
    partnershipDeed: { type: String, default: "" },
    partners: { type: [PartnerSchema], default: [] },

    // LLP
    llpName: { type: String, default: "" },
    llpRegistrationNo: { type: String, default: "" },
    llpPan: { type: String, default: "" },
    llpIncorporationDate: { type: String, default: "" },
    numberOfDesignatedPartners: { type: Number, default: 0 },
    llpCertificate: { type: String, default: "" },
    llpAgreement: { type: String, default: "" },
    designatedPartners: { type: [DirectorSchema], default: [] },

    // Pvt Ltd
    pvtLtdName: { type: String, default: "" },
    cinNumber: { type: String, default: "" },
    pvtLtdPan: { type: String, default: "" },
    incorporationDate: { type: String, default: "" },
    authorizedCapital: { type: String, default: "" },
    paidUpCapital: { type: String, default: "" },
    numberOfDirectors: { type: Number, default: 0 },
    incorporationCertificate: { type: String, default: "" },
    moaDocument: { type: String, default: "" },
    aoaDocument: { type: String, default: "" },
    directors: { type: [DirectorSchema], default: [] },

    // Public Ltd
    publicLtdName: { type: String, default: "" },
    publicCinNumber: { type: String, default: "" },
    publicLtdPan: { type: String, default: "" },
    publicIncorporationDate: { type: String, default: "" },
    listedStatus: { type: String, default: "NO" },
    stockExchange: { type: String, default: "" },
    publicAuthorizedCapital: { type: String, default: "" },
    publicPaidUpCapital: { type: String, default: "" },
    publicNumberOfDirectors: { type: Number, default: 0 },
    publicIncorporationCertificate: { type: String, default: "" },
    publicMoaDocument: { type: String, default: "" },
    publicAoaDocument: { type: String, default: "" },
    publicDirectors: { type: [DirectorSchema], default: [] },

    // Store Setup
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },
    storeName: { type: String, default: "" },
    storeDescription: { type: String, default: "" },
    storeAddress: { type: String, default: "" },
    storeCity: { type: String, default: "" },
    storeState: { type: String, default: "" },
    storePincode: { type: String, default: "" },
    storeCategories: { type: [StoreCategorySchema], default: [] },
    storeLogo: { type: String, default: "" },
    storeBanner: { type: String, default: "" },

    pickupAddress: { type: String, default: "" },
    pickupPincode: { type: String, default: "" },
    pickupContact: { type: String, default: "" },
    esignature: { type: String, default: "" },
    addressProof: { type: String, default: "" },
    photoId: { type: String, default: "" },

    // Business Documents
    businessLicense: { type: String, default: "" },
    taxCertificate: { type: String, default: "" },
    identityProof: { type: String, default: "" },

    // Bank Details
    bankName: { type: String, default: "" },
    accountHolderName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    routingNumber: { type: String, default: "" },
    accountType: { type: String, default: "" },

    // Terms
    termsAccepted: { type: Boolean, default: false },

    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      lowercase: true,
    },
    approvalReason: { type: String, default: "" },
    statusReason: { type: String, default: "" },
    approvedAt: { type: Date },
    suspendedAt: { type: Date },

    // Password reset
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Seller", SellerSchema);
