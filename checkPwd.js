// checkPassword.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Customer from "./models/Customer.js"; // adjust path if needed

// 👉 ENTER YOUR TEST VALUES HERE
const EMAIL_OR_MOBILE = "jeevigiri22@gmail.com";
const PLAIN_PASSWORD = "JEEVITHA123";

async function run() {
  try {
    // 1. CONNECT TO MONGO
    await mongoose.connect("mongodb://127.0.0.1:27017/shopee", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🔗 MongoDB connected");

    // 2. FIND USER BY EMAIL OR MOBILE
    const user = await Customer.findOne({
      $or: [
        { email: EMAIL_OR_MOBILE.toLowerCase() },
        { mobile: EMAIL_OR_MOBILE },
      ],
    });

    if (!user) {
      console.log("❌ User not found");
      process.exit();
    }

    console.log("👤 User found:", user.fullName);
    console.log("🔐 Stored hash:", user.password);

    // 3. CHECK PASSWORD
    const isMatch = await bcrypt.compare(PLAIN_PASSWORD, user.password);

    if (isMatch) {
      console.log("✅ Password MATCHES! ✔✔✔");
    } else {
      console.log("❌ Password does NOT match ❌");
    }

    process.exit();
  } catch (err) {
    console.error("Error:", err);
    process.exit();
  }
}

run();
