import express from "express";

import { addToCart, getCartDetails, removeFromCart, clearUserCart } from "../controllers/cartController.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import roleAuth from "../middleware/roleAuth.js";

const cartRouter = express.Router();

// User-protected routes
cartRouter.post("/add", userAuth, addToCart);
cartRouter.get("/list/:userId", userAuth, getCartDetails);
cartRouter.delete("/remove", userAuth, removeFromCart);

// Admin-only route
cartRouter.post("/clear", adminAuth, roleAuth(['admin']), clearUserCart); // Admin endpoint to clear user cart

export default cartRouter;
