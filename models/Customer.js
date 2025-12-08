import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "" }, // "Home", "Office", etc.
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: "India" },
  phone: { type: String, default: "" },
  isDefault: { type: Boolean, default: false },
});

const customerSchema = new mongoose.Schema(
  {
    // ✅ Keep your existing fields
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
      match: /^\+91[0-9]{10}$/,
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
      match: /^[0-9]{6}$/,
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

    customerOwnCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      uppercase: true,
    },

    referralCodeUsed: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    agreeToTerms: {
      type: Boolean,
      required: true,
    },

    // ✅ ADD these new fields for admin management
    // Split fullName into firstName and lastName (virtual fields)
    firstName: {
      type: String,
      default: function () {
        return this.fullName ? this.fullName.split(" ")[0] : "";
      },
    },

    lastName: {
      type: String,
      default: function () {
        const parts = this.fullName ? this.fullName.split(" ") : [];
        return parts.length > 1 ? parts.slice(1).join(" ") : "";
      },
    },

    // Phone field (map from mobile for compatibility)
    phone: {
      type: String,
      default: function () {
        return this.mobile || "";
      },
    },

    // Additional addresses array
    addresses: [addressSchema],

    // In models/Customer.js, change this line:
    status: { type: String, default: "pending" }, // Change from "active" to "pending"
    statusReason: {
      type: String,
      default: null,
    },

    // Order Statistics
    ordersCount: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    averageOrderValue: {
      type: Number,
      default: 0,
    },

    // Wishlist & Cart
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Email Verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: "",
    },

    // Password Reset
    resetPasswordToken: {
      type: String,
      default: "",
    },

    resetPasswordExpire: {
      type: Date,
    },

    // Admin Notes
    notes: {
      type: String,
      default: "",
    },

    // Last Activity
    lastLogin: {
      type: Date,
    },

    lastOrderDate: {
      type: Date,
    },

    // Date of Birth (use existing dob)
    dateOfBirth: {
      type: Date,
      default: function () {
        return this.dob;
      },
    },
  },
  { timestamps: true }
);

// ✅ Virtual fields for compatibility
customerSchema.virtual("name").get(function () {
  return this.fullName;
});

// Ensure virtuals are included in JSON
customerSchema.set("toJSON", { virtuals: true });
customerSchema.set("toObject", { virtuals: true });

// ✅ Keep your existing password methods
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

customerSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ✅ ADD: Pre-save hook to sync firstName/lastName with fullName
customerSchema.pre("save", function (next) {
  // If fullName is modified, update firstName and lastName
  if (this.isModified("fullName") && this.fullName) {
    const parts = this.fullName.split(" ");
    this.firstName = parts[0] || "";
    this.lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
  }

  // Sync phone with mobile
  if (this.isModified("mobile")) {
    this.phone = this.mobile;
  }

  // Sync dateOfBirth with dob
  if (this.isModified("dob")) {
    this.dateOfBirth = this.dob;
  }

  next();
});

export default mongoose.model("Customer", customerSchema);
