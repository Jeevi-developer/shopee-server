import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    title: String,
    description: String,
    price: Number,
    stock: Number,
    sku: String,
    categories: [String],
    images: [String],

    // approval system fields
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedAt: Date,
    approvalReason: String,
    isPublic: { type: Boolean, default: false },

    // optional cached seller info for quick search (redundant)
    sellerInfo: {
      businessName: String,
      email: String,
      phone: String,
    },

    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
