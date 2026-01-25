//product
import express from "express";
import {
  addProduct,
  listProducts,
  removeProduct,
  getSingleProduct,
  updateProduct,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import roleAuth from "../middleware/roleAuth.js";

const productRouter = express.Router();

// Public routes
productRouter.get("/single/:id", getSingleProduct);
productRouter.get("/list", listProducts);

// Admin-only routes
productRouter.post(
  "/add",
  adminAuth,
  roleAuth(['admin']),
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);
productRouter.post("/remove", adminAuth, roleAuth(['admin']), removeProduct);
productRouter.post(
  "/update",
  adminAuth,
  roleAuth(['admin']),
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateProduct
);

export default productRouter;
