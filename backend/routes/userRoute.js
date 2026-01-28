import express from "express";
import {
  loginUser,
  registerUser,
  loginAdmin,
  logoutUser,
  logoutAdmin,
  getProfile,
  getAllUsers,
  changeAdminPassword,
  resetAdminPassword,
  forgotPassword,
  resetPassword,
  updateProfile,
} from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";
import roleAuth from "../middleware/roleAuth.js";
import { protectLogin } from "../middleware/bruteForceProtection.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", protectLogin("user"), loginUser);
userRouter.post("/admin", protectLogin("admin"), loginAdmin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

// Logout routes
userRouter.post("/logout", userAuth, logoutUser);
userRouter.post("/admin/logout", adminAuth, logoutAdmin);

// Protected routes - User authentication required
userRouter.get("/profile/:id", userAuth, getProfile);
userRouter.put("/profile/:id", userAuth, updateProfile);

// Admin-only routes
userRouter.get("/all", adminAuth, roleAuth(['admin']), getAllUsers);
userRouter.post("/change-admin-password", adminAuth, changeAdminPassword);
userRouter.post("/reset-admin-password", adminAuth, roleAuth(['admin']), resetAdminPassword); // For debugging/reset

export default userRouter;
