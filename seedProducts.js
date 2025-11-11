import mongoose from "mongoose";
import Products from "./models/Product.js";
import fs from "fs";

const MONGO_URI = "mongodb://127.0.0.1:27017/shopee";

async function seedProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    const data = JSON.parse(fs.readFileSync("./data/products.json", "utf-8"));

    await Products.deleteMany(); // clear old data
    console.log("🗑️ Old products removed");

    await Products.insertMany(data);
    console.log("✅ Products inserted successfully!");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedProducts();
