// controllers/adminProductController.js
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";

/**
 * GET /api/admin/products
 * Query params: search, status, page, limit, sort
 */
export const listProductsForApproval = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 20, sort = "-createdAt" } = req.query;
    const q = {};

    if (search) {
      const re = new RegExp(search.trim(), "i");
      q.$or = [
        { title: re },
        { sku: re },
        { "sellerInfo.businessName": re },
        { "sellerInfo.email": re },
        { description: re },
      ];
    }

    if (status) q.approvalStatus = status; // Pending | Approved | Rejected

    const pageNum = Math.max(1, parseInt(page));
    const lim = Math.max(1, parseInt(limit));

    const [total, products] = await Promise.all([
      Product.countDocuments(q),
      Product.find(q)
        .sort(sort)
        .skip((pageNum - 1) * lim)
        .limit(lim)
        .populate("seller", "businessName email phone")
        .lean(),
    ]);

    return res.json({ success: true, total, page: pageNum, limit: lim, products });
  } catch (err) {
    console.error("listProductsForApproval error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/admin/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("seller", "businessName email").lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, product });
  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /api/admin/products/:id/approve
 * body: { action: "approve"|"reject", reason? }
 */
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (action === "approve") {
      product.approvalStatus = "Approved";
      product.approvedAt = new Date();
      product.approvalReason = reason || "";
      product.isPublic = true; // publish to catalog
    } else if (action === "reject") {
      product.approvalStatus = "Rejected";
      product.approvedAt = undefined;
      product.approvalReason = reason || "";
      product.isPublic = false;
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await product.save();

    // (optional) send notification to seller here (Brevo or other)
    return res.json({ success: true, message: `Product ${action}d`, product });
  } catch (err) {
    console.error("approveProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PATCH /api/admin/products/:id
 * Admin edits certain product fields
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ["title", "price", "stock", "description", "categories", "sku", "isPublic"];
    const payload = {};
    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];

    if (Object.keys(payload).length === 0) return res.status(400).json({ success: false, message: "No fields to update" });

    const product = await Product.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    return res.json({ success: true, message: "Product updated", product });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE /api/admin/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id).lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, message: "Product deleted", product });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /api/admin/products/bulk
 * body: { ids: [], action: 'approve'|'reject' }
 */
export const bulkAction = async (req, res) => {
  try {
    const { ids = [], action, reason } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: "No ids provided" });

    const update = {};
    if (action === "approve") {
      update.$set = { approvalStatus: "Approved", approvedAt: new Date(), approvalReason: reason || "", isPublic: true };
    } else if (action === "reject") {
      update.$set = { approvalStatus: "Rejected", approvedAt: undefined, approvalReason: reason || "", isPublic: false };
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const result = await Product.updateMany({ _id: { $in: ids } }, update);
    return res.json({ success: true, message: `Bulk ${action} completed`, result });
  } catch (err) {
    console.error("bulkAction error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
