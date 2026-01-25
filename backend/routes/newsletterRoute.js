import express from "express";
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getAllSubscribers,
  deleteSubscriber,
} from "../controllers/newsletterController.js";
import adminAuth from "../middleware/adminAuth.js";
import roleAuth from "../middleware/roleAuth.js";

const newsletterRouter = express.Router();

// Public routes
newsletterRouter.post("/subscribe", subscribeNewsletter);
newsletterRouter.post("/unsubscribe", unsubscribeNewsletter);

// Admin-only routes
newsletterRouter.get("/all", adminAuth, roleAuth(['admin']), getAllSubscribers);
newsletterRouter.delete("/delete/:id", adminAuth, roleAuth(['admin']), deleteSubscriber);

export default newsletterRouter;

