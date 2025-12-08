import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Admin from "./models/Admin.js";
import bcrypt from "bcryptjs";

const createAdmins = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log("Using URI:", process.env.MONGO_URI); // debug

    await mongoose.connect(process.env.MONGO_URI);

    const admins = [
      {
        name: "Super Admin",
        email: "indxindshopeepvtltd@gmail.com",
        password: bcrypt.hashSync("SENTHILmurugan@123", 10),
        role: "super-admin",
      }
    ];

    await Admin.insertMany(admins);

    console.log("✅ Admin created successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admins:", err);
    process.exit(1);
  }
};

createAdmins();
