import express from "express";
import Product from "../models/Product.js";
import {
  getFeaturedProducts,
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

console.log("📦 Product Routes Loaded");


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

// Add product
router.post("/add", upload.array("images", 10), async (req, res) => {
  try {
    let {
      name,
      categories,
      price,
      stock,
      description,
      discount,
      buyList,
      sizes,
      deliveryOptions,
      color,
      material,
      compatibleModels,
      netQuantity,
      theme,
      type,
      countryOfOrigin,
      sellerId,
    } = req.body;

    // ---------------------------
    // Parse JSON fields
    // ---------------------------
    if (categories) categories = JSON.parse(categories);
    if (buyList) buyList = JSON.parse(buyList);
    if (sizes) sizes = JSON.parse(sizes);
    if (deliveryOptions) deliveryOptions = JSON.parse(deliveryOptions);

    // ---------------------------
    // Validate required fields
    // ---------------------------
    if (!name || !categories?.length || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ---------------------------
    // Convert images to file paths
    // ---------------------------
    const images =
      req.files?.map((file) => `/uploads/products/${file.filename}`) || [];

    // ---------------------------
    // Create product
    // ---------------------------
    const product = await Product.create({
      seller: sellerId,
      name,
      categories,
      price,
      stock,
      description,
      discount,
      buyList,
      sizes,
      deliveryOptions,
      color,
      material,
      compatibleModels,
      netQuantity,
      theme,
      type,
      countryOfOrigin,
      images,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (err) {
    console.error("Product Add Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ---------------------------
// LIST ALL PRODUCTS (MIDDLE)
// ---------------------------
router.get("/", getAllProducts);

// ---------------------------
// GET PRODUCT BY ID (LAST)
// ---------------------------
router.get("/:id", getProductById);

export default router;
