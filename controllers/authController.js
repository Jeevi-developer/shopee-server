import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    let { fullName, emailOrMobile, password, referralCode } = req.body;

    if (!fullName || !emailOrMobile || !password)
      return res.status(400).json({ message: "All fields required" });

    // Trim input
    emailOrMobile = emailOrMobile.trim();
    password = password.trim();

    const existingUser = await User.findOne({ emailOrMobile });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      emailOrMobile,
      password: hashedPassword,
      referralCode,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    let { emailOrMobile, password } = req.body;
    if (!emailOrMobile || !password)
      return res.status(400).json({ message: "All fields required" });

    emailOrMobile = emailOrMobile.trim();
    password = password.trim();

    const user = await User.findOne({ emailOrMobile });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, emailOrMobile: user.emailOrMobile },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        emailOrMobile: user.emailOrMobile,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
