import Product from "../models/Product.js";
import Seller from "../models/Seller.js";

// Create a new product by seller
export const addProduct = async (req, res) => {
  try {
    const sellerId = req.user.id; // assuming you have seller authentication middleware
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const {
      title,
      description,
      price,
      stock,
      sku,
      categories,
      images, // array of image URLs (or file paths after upload)
      isPublic,
    } = req.body;

    const product = new Product({
      seller: sellerId,
      title,
      description,
      price: Number(price),
      stock: Number(stock) || 0,
      sku,
      categories: Array.isArray(categories) ? categories : [],
      images: Array.isArray(images) ? images : [],
      approvalStatus: "Pending",
      isPublic: isPublic || false,
      sellerInfo: {
        businessName: seller.businessName,
        email: seller.email,
        phone: seller.phone,
      },
    });

    await product.save();

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load featured products",
      error: err.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: err.message,
    });
  }
};
