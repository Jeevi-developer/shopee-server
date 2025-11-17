import express from "express";
import Product from "../models/Product.js";
import {
  getFeaturedProducts,
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";

const router = express.Router();

// ---------------------------
// SEARCH ROUTE (FIRST)
// ---------------------------
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    console.log("Search API called:", q);

    const products = await Product.find({
      name: { $regex: q, $options: "i" },
    });

    res.json(products);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

// ---------------------------
// STATIC ROUTES
// ---------------------------
router.get("/featured", getFeaturedProducts);
router.get("/test", (req, res) => res.send("Product route working"));

// ---------------------------
// LIST ALL PRODUCTS (MIDDLE)
// ---------------------------
router.get("/", getAllProducts);

// ---------------------------
// GET PRODUCT BY ID (LAST)
// ---------------------------
router.get("/:id", getProductById);

export default router;
