import express from "express";
import {
  getFeaturedProducts,
  getAllProducts,
  getProductById
} from "../controllers/productController.js";

const router = express.Router();

// ✅ Static routes FIRST
router.get("/featured", getFeaturedProducts);
router.get("/test", (req, res) => res.send("✅ Product route working!"));

// ✅ Regular list route
router.get("/", getAllProducts);

// ✅ Dynamic route LAST
router.get("/:id", getProductById);

export default router;
