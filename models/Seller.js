// ============================================
// 1. UPDATED MONGOOSE SCHEMA (Seller.js)
// ============================================
import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  // Personal Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: String, default: "" },
  referralCode: { type: String, default: "" },
  referredBy: { type: String, default: "" },

  // Agreement
  agreementVersion: { type: String, default: "v1.0" },
  isAgreementUploaded: { type: Boolean, default: false },
  signedAgreementURL: { type: String, default: "" },
  adminAgreementApproval: {
    status: { type: String, default: "pending" },
    approvedBy: { type: String, default: "" },
    approvedAt: { type: Date },
    remarks: { type: String, default: "" }
  },
  agreementUploadedAt: { type: Date },

  // Business Info
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

  hasGst: { type: String, default: "No" },
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
  numberOfPartners: { type: Number, default: 0 },
  partners: { type: Array, default: [] },
  partnershipDeedDate: { type: String, default: "" },
  partnershipPan: { type: String, default: "" },
  partnershipDeed: { type: String, default: "" },

  // LLP
  llpName: { type: String, default: "" },
  llpRegistrationNo: { type: String, default: "" },
  llpPan: { type: String, default: "" },
  llpIncorporationDate: { type: String, default: "" },
  numberOfDesignatedPartners: { type: Number, default: 0 },
  designatedPartners: { type: Array, default: [] },
  llpCertificate: { type: String, default: "" },
  llpAgreement: { type: String, default: "" },

  // Private Limited
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
  directors: { type: Array, default: [] },

  // Public Limited
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
  publicDirectors: { type: Array, default: [] },

  // Store Setup
  gstin: { type: String, default: "" },
  pan: { type: String, default: "" },
  storeName: { type: String, default: "" },
  storeDescription: { type: String, default: "" },
  storeAddress: { type: String, default: "" },
  storeCity: { type: String, default: "" },
  storeState: { type: String, default: "" },
  storePincode: { type: String, default: "" },
  storeCategories: { type: Array, default: [] },
  storeLogo: { type: String, default: "" },
  storeBanner: { type: String, default: "" },

  // Pickup Details
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
  branchName: { type: String, default: "" },
  ifscCode: { type: String, default: "" },
  bankStatement: { type: String, default: "" },

  // Terms
  termsAccepted: { type: Boolean, default: false },

  // Status & Admin Fields
  status: { type: String, default: "pending" },
  approvalReason: { type: String, default: "" },
  statusReason: { type: String, default: "" },
  approvedAt: { type: Date },
  suspendedAt: { type: Date },

  // Password Reset
  resetPasswordToken: { type: String, default: "" },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

export default mongoose.model("Seller", sellerSchema);

