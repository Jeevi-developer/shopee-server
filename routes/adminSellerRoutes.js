// routes/adminSellerRoutes.js
import express from "express";
import {
  listSellers,
  getSellerById,
  approveSeller,
  updateSellerStatus,
  updateSeller,
  deleteSeller,
  sellersStats,
} from "../controllers/adminSellerController.js";
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

// change general status
router.put("/:id/status", updateSellerStatus);

// update details
router.patch("/:id", updateSeller);

// delete
router.delete("/:id", deleteSeller);

export default router;
