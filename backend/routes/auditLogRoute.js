import express from "express";
import {
  getAllAuditLogs,
  getAuditLogById,
  getAuditLogStats,
  getCriticalEvents,
  deleteOldAuditLogs,
} from "../controllers/auditLogController.js";
import adminAuth from "../middleware/adminAuth.js";
import roleAuth from "../middleware/roleAuth.js";

const auditLogRouter = express.Router();

// All routes require admin authentication
auditLogRouter.use(adminAuth);
auditLogRouter.use(roleAuth(['admin']));

// Get all audit logs with filtering
auditLogRouter.get("/", getAllAuditLogs);

// Get audit log statistics
auditLogRouter.get("/stats", getAuditLogStats);

// Get critical security events
auditLogRouter.get("/critical", getCriticalEvents);

// Get single audit log by ID
auditLogRouter.get("/:id", getAuditLogById);

// Delete old audit logs (use with caution)
auditLogRouter.delete("/old", deleteOldAuditLogs);

export default auditLogRouter;
