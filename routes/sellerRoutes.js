import express from "express";
import multer from "multer";
import path from "path";
import {
  registerSeller,
  loginSeller,
  requestSellerPasswordReset,
  resetSellerPassword,
} from "../controllers/sellerController.js";

const router = express.Router();


// ✅ Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// ✅ File Filter (only accept specific formats)
const fileFilter = (req, file, cb) => {
  const allowedExt = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  console.log(`🧐 Checking file: ${file.originalname} (${file.mimetype})`);

  if (allowedExt.includes(ext)) {
    console.log(`✅ Accepted file: ${file.originalname}`);
    cb(null, true);
  } else {
    console.warn(`❌ Rejected file: ${file.originalname} (ext: ${ext})`);
    cb(new Error("Invalid file type! Only JPG, PNG, PDF, DOC, DOCX allowed."));
  }
};

// ✅ Multer setup – accepts any field name (safe with filter)
const uploadAny = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB per file
  fileFilter,
}).any();

// ✅ Register Seller Route
router.post(
  "/register",
  uploadAny,
  (req, res, next) => {
    console.log("📸 Files received in upload:", req.files);
    console.log("🧾 Body fields received:", req.body);
    next();
  },
  registerSeller
);

router.post("/login", loginSeller);

// new forgot/reset routes
router.post("/forgot-password", requestSellerPasswordReset);
router.post("/reset-password/:token", resetSellerPassword);

export default router;
