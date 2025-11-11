import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();


mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/shopee")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const sellerSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Seller = mongoose.model("Seller", sellerSchema);

async function checkPassword(email, rawPassword) {
  try {
    const seller = await Seller.findOne({ email });
    if (!seller) {
      console.log("❌ Seller not found");
      return;
    }

    const isMatch = await bcrypt.compare(rawPassword, seller.password);
    console.log(
      isMatch
        ? "✅ Password matches!"
        : "❌ Password does NOT match!"
    );
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

// 🔹 Replace with your email and raw password
checkPassword("jeevigiri22@gmail.com", "JEEVITHA@123");
