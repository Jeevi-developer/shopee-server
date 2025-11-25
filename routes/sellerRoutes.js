import express from "express";
import multer from "multer";
import path from "path";
import {
  registerSeller,
  loginSeller,
  requestSellerPasswordReset,
  resetSellerPassword
} from "../controllers/sellerController.js";

const router = express.Router();

// --- multer storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// allowed file types
const allowedExt = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext)) cb(null, true);
  else cb(new Error("Invalid file type! Only JPG, PNG, PDF, DOC, DOCX allowed."));
};

// increase per-file limit here (10MB)
const uploadAny = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
}).any();

// Register
router.post("/register", uploadAny, (req, res, next) => {
  console.log("Files:", req.files?.map(f => f.fieldname) || []);
  console.log("Body keys:", Object.keys(req.body));
  next();
}, registerSeller);

// Login & password reset
router.post("/login", loginSeller);
router.post("/forgot-password", requestSellerPasswordReset);
router.post("/reset-password/:token", resetSellerPassword);

export default router;
