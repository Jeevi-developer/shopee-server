import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: String,
  banner: String,
  subcategories: [
    {
      name: String,
      image: String
    }
  ]
});

export default mongoose.model("Category", CategorySchema);
