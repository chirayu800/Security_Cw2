import express from "express";
import {
  submitContact,
  getAllContacts,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";
import adminAuth from "../middleware/adminAuth.js";
import roleAuth from "../middleware/roleAuth.js";

const contactRouter = express.Router();

// Public routes
contactRouter.post("/submit", submitContact);

// Admin-only routes
contactRouter.get("/all", adminAuth, roleAuth(['admin']), getAllContacts);
contactRouter.put("/status/:id", adminAuth, roleAuth(['admin']), updateContactStatus);
contactRouter.delete("/delete/:id", adminAuth, roleAuth(['admin']), deleteContact);

export default contactRouter;

