import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  businessName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: "" },
  profileImage: { type: String, default: "https://via.placeholder.com/150" },
  businessType: { type: String, default: "Retail" },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }, // Add this for approval flow
  totalProducts: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Seller", sellerSchema);
