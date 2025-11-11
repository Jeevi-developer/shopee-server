// hashExistingPasswords.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/shopee")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  businessName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: "" },
  profileImage: { type: String, default: "https://via.placeholder.com/150" },
  businessType: { type: String, default: "Retail" },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  totalProducts: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Seller = mongoose.model("Seller", sellerSchema);

async function hashExistingPasswords() {
  try {
    const sellers = await Seller.find();

    for (const seller of sellers) {
      if (!seller.password.startsWith("$2a$")) {
        const hashed = await bcrypt.hash(seller.password, 10);
        // ✅ Update password without validation
        await Seller.updateOne(
          { _id: seller._id },
          { $set: { password: hashed, updatedAt: new Date() } },
          { runValidators: false }
        );
        console.log(`✅ Password hashed for seller: ${seller.email}`);
      } else {
        console.log(`ℹ️ Already hashed: ${seller.email}`);
      }
    }

    console.log("🎉 All passwords processed successfully!");
  } catch (err) {
    console.error("❌ Error hashing passwords:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

hashExistingPasswords();

