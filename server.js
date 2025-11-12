import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import sellerRoutes from "./routes/sellerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

// ✅ Fix __dirname issue for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static folder
app.use("/images", express.static(path.join(__dirname, "images")));

// ✅ Create uploads folder if not exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir)); // Serve static files
app.use("/api/seller", sellerRoutes);
app.use("/api/auth", authRoutes); // ✅ all auth routes now under /api
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Routes
app.use("/api/admin", adminRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: "shopee", // ✅ This forces Mongoose to use this DB
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Routes
app.get("/", (req, res) => res.send("🚀 Server is running successfully!"));

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
