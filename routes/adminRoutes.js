import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = express.Router();

// ✅ Admin Registration (one-time setup)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const newAdmin = new Admin({ name, email, password });
    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Admin Login
router.post("/login", async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    const admin = await Admin.findOne({
      $or: [{ email: emailOrMobile }],
    });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin", email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👑 Protected route example
router.get("/dashboard", verifyAdmin, async (req, res) => {
  res.json({ message: `Welcome, ${req.admin.email}!`, role: req.admin.role });
});

export default router;
