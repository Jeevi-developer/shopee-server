import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { fullName, emailOrMobile, password, referralCode } = req.body;

    const existingUser = await User.findOne({ emailOrMobile });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      fullName,
      emailOrMobile,
      password,
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
    const { emailOrMobile, password } = req.body;
    const user = await User.findOne({ emailOrMobile });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    res.status(200).json({
      message: "Login successful",
      user: { fullName: user.fullName, emailOrMobile: user.emailOrMobile },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
