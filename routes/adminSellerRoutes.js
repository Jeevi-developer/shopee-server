import express from "express";
import {
  listSellers,
  getSellerById,
  approveSeller,
  updateSellerStatus,
  updateSeller,
  deleteSeller,
  sellersStats,
  adminAuth,
} from "../controllers/adminSellerController.js";
import Seller from "../models/Seller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = express.Router();

// all routes protected
router.use(verifyAdmin);

// list + search + pagination
router.get("/", listSellers);

// stats
router.get("/stats", sellersStats);

// get single
router.get("/:id", getSellerById);

// approve/reject
router.put("/:id/approve", approveSeller);

router.post("/admin/seller/agreement-approve", adminAuth, async (req, res) => {
  const { sellerId, status, remarks } = req.body;

  const seller = await Seller.findById(sellerId);
  seller.adminAgreementApproval.status = status; // approved / rejected
  seller.adminAgreementApproval.reviewedBy = req.adminId;
  seller.adminAgreementApproval.reviewedAt = new Date();
  seller.adminAgreementApproval.remarks = remarks;

  await seller.save();

  res.json({ success: true, message: "Seller agreement status updated" });
});

// change general status
router.put("/:id/status", updateSellerStatus);

// update details
router.patch("/:id", updateSeller);

// delete
router.delete("/:id", deleteSeller);

export default router;
