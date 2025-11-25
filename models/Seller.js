import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    name: String,
    panNo: String,
    share: String,
    address: String,
    mobile: String,
  },
  { _id: false }
);

const DirectorSchema = new mongoose.Schema(
  {
    name: String,
    dinNo: String,
    panNo: String,
    address: String,
  },
  { _id: false }
);

const StoreCategorySchema = new mongoose.Schema(
  {
    category: String,
    customCategory: String,
  },
  { _id: false }
);

const SellerSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    phone: String,
    password: String,
    dateOfBirth: String,

    businessName: String,
    businessType: String,
    businessRegNumber: String,
    taxId: String,
    businessAddress: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,

    natureOfConcern: String,
    firmName: String,
    nameAsPerPan: String,
    hasGst: String,
    gstNumber: String,
    gstFile: String,

    proprietorName: String,
    proprietorDob: String,
    proprietorPan: String,
    proprietorAadhaar: String,
    proprietorMobile: String,
    proprietorEmail: String,
    proprietorAddress: String,
    proprietorPanCard: String,
    proprietorAadhaarCard: String,
    proprietorPhoto: String,

    partnershipDeedDate: String,
    numberOfPartners: Number,
    partnershipPan: String,
    partnershipDeed: String,
    partners: [PartnerSchema],

    llpName: String,
    llpRegistrationNo: String,
    llpPan: String,
    llpIncorporationDate: String,
    numberOfDesignatedPartners: Number,
    llpCertificate: String,
    llpAgreement: String,
    designatedPartners: [DirectorSchema],

    pvtLtdName: String,
    cinNumber: String,
    pvtLtdPan: String,
    incorporationDate: String,
    authorizedCapital: String,
    paidUpCapital: String,
    numberOfDirectors: Number,
    incorporationCertificate: String,
    moaDocument: String,
    aoaDocument: String,
    directors: [DirectorSchema],

    publicLtdName: String,
    publicCinNumber: String,
    publicLtdPan: String,
    publicIncorporationDate: String,
    listedStatus: String,
    stockExchange: String,
    publicAuthorizedCapital: String,
    publicPaidUpCapital: String,
    publicNumberOfDirectors: Number,
    publicIncorporationCertificate: String,
    publicMoaDocument: String,
    publicAoaDocument: String,
    publicDirectors: [DirectorSchema],

    gstin: String,
    pan: String,
    storeName: String,
    storeDescription: String,
    storeAddress: String,
    storeCity: String,
    storeState: String,
    storePincode: String,
    storeCategories: [StoreCategorySchema],
    storeLogo: String,
    storeBanner: String,

    pickupAddress: String,
    pickupPincode: String,
    pickupContact: String,
    esignature: String,
    addressProof: String,
    photoId: String,

    businessLicense: String,
    taxCertificate: String,
    identityProof: String,

    bankName: String,
    accountHolderName: String,
    accountNumber: String,
    routingNumber: String,
    accountType: String,

    termsAccepted: Boolean,

    accountStatus: { type: String, default: "Pending" },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // in SellerSchema fields:
    approvedAt: Date,
    approvalReason: String,
    suspendedAt: Date,
    statusReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("Seller", SellerSchema);
