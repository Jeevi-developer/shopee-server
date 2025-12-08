// controllers/adminSellerController.js
import Seller from "../models/Seller.js";

// ==================== List Sellers ====================
export const listSellers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ Use 'status' field (or 'accountStatus' if you haven't migrated)
    if (status) {
      query.status = status.toLowerCase();
      // If you're still using accountStatus, use this instead:
      // query.accountStatus = status;
    }

    const sellers = await Seller.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Seller.countDocuments(query);

    res.json({
      success: true,
      sellers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (err) {
    console.error("Error listing sellers:", err);
    res.status(500).json({ success: false, message: "Error fetching sellers" });
  }
};

// ==================== Get Seller by ID ====================
export const getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select("-password");

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    res.json({ success: true, seller });
  } catch (err) {
    console.error("Error fetching seller:", err);
    res.status(500).json({ success: false, message: "Error fetching seller" });
  }
};

// ==================== Approve/Reject Seller ====================
export const approveSeller = async (req, res) => {
  try {
    const { approved, reason } = req.body;

    const updateData = {
      status: approved ? "approved" : "rejected", // ✅ Must use 'status'
      statusReason: reason || "",
      approvalReason: reason || "",
    };

    if (approved) {
      updateData.approvedAt = new Date();
    }

    const seller = await Seller.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    res.json({
      success: true,
      message: `Seller ${approved ? "approved" : "rejected"} successfully`,
      seller,
    });
  } catch (err) {
    console.error("Error approving/rejecting seller:", err);
    res
      .status(500)
      .json({ success: false, message: "Error updating seller status" });
  }
};

// ==================== Update Seller Status ====================
export const updateSellerStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    // Validate status
    const validStatuses = ["pending", "approved", "rejected", "suspended"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be: pending, approved, rejected, or suspended",
      });
    }

    const updateData = {
      status: status.toLowerCase(),
      statusReason: reason || "",
    };

    // Add timestamps for specific statuses
    if (status.toLowerCase() === "approved") {
      updateData.approvedAt = new Date();
    } else if (status.toLowerCase() === "suspended") {
      updateData.suspendedAt = new Date();
    }

    const seller = await Seller.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    res.json({
      success: true,
      message: `Seller status updated to ${status}`,
      seller,
    });
  } catch (err) {
    console.error("Error updating seller status:", err);
    res
      .status(500)
      .json({ success: false, message: "Error updating seller status" });
  }
};

// ==================== Update Seller Details ====================
export const updateSeller = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    const seller = await Seller.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    res.json({
      success: true,
      message: "Seller updated successfully",
      seller,
    });
  } catch (err) {
    console.error("Error updating seller:", err);
    res.status(500).json({ success: false, message: "Error updating seller" });
  }
};

// ==================== Delete Seller ====================
export const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.params.id);

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    res.json({
      success: true,
      message: "Seller deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting seller:", err);
    res.status(500).json({ success: false, message: "Error deleting seller" });
  }
};

// ==================== Sellers Stats ====================
export const sellersStats = async (req, res) => {
  try {
    const total = await Seller.countDocuments();
    const pending = await Seller.countDocuments({ status: "pending" });
    const approved = await Seller.countDocuments({ status: "approved" });
    const rejected = await Seller.countDocuments({ status: "rejected" });
    const suspended = await Seller.countDocuments({ status: "suspended" });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        suspended,
      },
    });
  } catch (err) {
    console.error("Error fetching seller stats:", err);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};

export const adminAuth = (req, res, next) => {
  if (!req.adminId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};
