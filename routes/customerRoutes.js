import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import Customer from "../models/Customer.js";

const router = express.Router();

router.put("/update-profile", authenticateToken , async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedUser = await Customer.findByIdAndUpdate(
      userId,
      {
        fullName: req.body.fullName,
        email: req.body.email,
        mobile: req.body.mobile,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
