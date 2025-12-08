// routes/adminProductRoutes.js
import express from "express";
import {
  listProductsForApproval,
  getProductById,
  approveProduct,
  updateProduct,
  deleteProduct,
  bulkAction
} from "../controllers/adminProductController.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = express.Router();
router.use(verifyAdmin);

router.get("/", listProductsForApproval);
router.get("/:id", getProductById);
router.put("/:id/approve", approveProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.put("/bulk", bulkAction);

export default router;
