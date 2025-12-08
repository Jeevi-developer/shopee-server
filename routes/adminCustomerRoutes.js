import express from "express";
import Customer from "../models/Customer.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = express.Router();

// ✅ ADD THIS TO CHECK IF MIDDLEWARE IS LOADED
console.log("verifyAdmin middleware:", typeof verifyAdmin);

// ✅ GET ALL CUSTOMERS (with pagination, search, filter)
router.get("/customers/list", verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "", status = "" } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Fetch customers
    const customers = await Customer.find(query)
      .select("-password -resetPasswordToken -emailVerificationToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Count total
    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      customers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
});

// ✅ GET CUSTOMER STATS
router.get("/customers/stats", verifyAdmin, async (req, res) => {
  try {
    const total = await Customer.countDocuments();
    const pending = await Customer.countDocuments({ status: "pending" });
    const active = await Customer.countDocuments({ status: "active" });
    const rejected = await Customer.countDocuments({ status: "rejected" });
    const suspended = await Customer.countDocuments({ status: "suspended" });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        active,
        rejected,
        suspended,
        totalOrders: 0,
        totalRevenue: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
});

// ✅ GET SINGLE CUSTOMER BY ID
router.get("/customers/:id", verifyAdmin, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select(
      "-password -resetPasswordToken -emailVerificationToken"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
});

// ✅ APPROVE/REJECT CUSTOMER
router.put("/customers/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const { approved, reason } = req.body;

    const updateData = {
      status: approved ? "active" : "rejected",
      statusReason: reason || "",
      approvalReason: reason || "",
    };

    if (approved) {
      updateData.approvedAt = new Date();
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: approved
        ? "Customer approved successfully"
        : "Customer rejected",
      customer,
    });
  } catch (error) {
    console.error("Error approving/rejecting customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer approval status",
      error: error.message,
    });
  }
});

// ✅ UPDATE CUSTOMER STATUS (suspend/activate)
router.put("/customers/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!["approved", "suspended", "pending", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updateData = {
      status,
      statusReason: reason || "",
    };

    if (status === "suspended") {
      updateData.suspendedAt = new Date();
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: `Customer ${status} successfully`,
      customer,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer status",
      error: error.message,
    });
  }
});

// ✅ DELETE CUSTOMER
router.delete("/customers/:id", verifyAdmin, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
});

export default router;
