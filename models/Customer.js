import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    mobile: {
      type: String,
      required: true,
      match: /^\+91[0-9]{10}$/, // Actually correct → allows +91 + 10 digits = 13 chars
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{6}$/, // 6-digit PIN
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    referralCode: {
      type: String,
      default: null,
      trim: true,
    },

    agreeToTerms: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);
// Encrypt password before saving
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
customerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("Customer", customerSchema);
