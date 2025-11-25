import Seller from "../models/Seller.js";
import { sendApprovalEmail } from "../utils/sendEmail.js"; // <-- new helper

/**
 * GET /api/admin/sellers
 * query: search, status, page, limit, sort
 */
export const listSellers = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;
    const q = {};

    if (search) {
      const re = new RegExp(search.trim(), "i");
      q.$or = [
        { businessName: re },
        { email: re },
        { phone: re },
        { firstName: re },
        { lastName: re },
        { "storeCategories.category": re },
      ];
    }

    if (status) q.accountStatus = status; // e.g. Pending, Approved, Rejected, Suspended, Active

    const pageNum = Math.max(1, parseInt(page));
    const lim = Math.max(1, parseInt(limit));

    const [total, sellers] = await Promise.all([
      Seller.countDocuments(q),
      Seller.find(q)
        .sort(sort)
        .skip((pageNum - 1) * lim)
        .limit(lim)
        .lean(),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: lim,
      sellers,
    });
  } catch (err) {
    console.error("listSellers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id).lean();
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    res.json({ success: true, seller });
  } catch (err) {
    console.error("getSellerById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Approve / Reject registration or set accountStatus
 * PUT /api/admin/sellers/:id/approve
 * body: { action: 'approve'|'reject', reason?: '...' }
 */
export const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const seller = await Seller.findById(id);
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    if (action === "approve") {
      seller.accountStatus = "Approved";
      seller.approvedAt = new Date();
      seller.approvalReason = reason || "";
    } else if (action === "reject") {
      seller.accountStatus = "Rejected";
      seller.approvedAt = undefined;
      seller.approvalReason = reason || "";
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    await seller.save();

    // send email (fire-and-forget with try/catch so it doesn't block success response)
    (async () => {
      try {
        await sendApprovalEmail(seller.email, {
          sellerName: `${seller.firstName || ""} ${
            seller.lastName || ""
          }`.trim(),
          approved: action === "approve",
          reason: reason || "",
        });
        console.log(`Approval email sent to ${seller.email}`);
      } catch (emailErr) {
        console.error(
          "Failed to send approval email:",
          emailErr?.message || emailErr
        );
      }
    })();

    res.json({ success: true, message: `Seller ${action}d`, seller });
  } catch (err) {
    console.error("approveSeller error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
/**
 * Update status: Active, Suspended, Pending
 * PUT /api/admin/sellers/:id/status
 * body: { status: 'Active'|'Suspended'|'Pending' , reason? }
 */
export const updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const allowed = ["Active", "Suspended", "Pending", "Blocked"];
    if (!allowed.includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });

    const seller = await Seller.findById(id);
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    seller.accountStatus = status;
    seller.statusReason = reason || "";
    if (status === "Suspended" || status === "Blocked")
      seller.suspendedAt = new Date();
    else seller.suspendedAt = undefined;

    await seller.save();
    res.json({ success: true, message: "Seller status updated", seller });
  } catch (err) {
    console.error("updateSellerStatus error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update seller basic fields (admin editing)
 * PATCH /api/admin/sellers/:id
 * body: any allowed fields
 */
export const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    // whitelist fields to prevent accidental overwrite
    const allowed = [
      "firstName",
      "lastName",
      "businessName",
      "businessType",
      "phone",
      "email",
      "gstin",
      "pan",
      "storeName",
      "storeAddress",
      "storeCity",
      "storeState",
      "storePincode",
      "accountStatus",
      "bankName",
      "accountHolderName",
      "accountNumber",
      "routingNumber",
      "accountType",
    ];
    const payload = {};
    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];
    if (Object.keys(payload).length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No updatable fields provided" });

    const seller = await Seller.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    ).lean();
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller updated", seller });
  } catch (err) {
    console.error("updateSeller error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findByIdAndDelete(id).lean();
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    res.json({ success: true, message: "Seller deleted", seller });
  } catch (err) {
    console.error("deleteSeller error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET stats
 * GET /api/admin/sellers/stats
 */
export const sellersStats = async (req, res) => {
  try {
    const total = await Seller.countDocuments();
    const pending = await Seller.countDocuments({ accountStatus: "Pending" });
    const approved = await Seller.countDocuments({ accountStatus: "Approved" });
    const rejected = await Seller.countDocuments({ accountStatus: "Rejected" });
    const suspended = await Seller.countDocuments({
      accountStatus: "Suspended",
    });

    res.json({
      success: true,
      stats: { total, pending, approved, rejected, suspended },
    });
  } catch (err) {
    console.error("sellersStats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
