import mongoose from "mongoose";

/**
 * Audit Log Model
 * Tracks all security-relevant events and user actions
 */

const auditLogSchema = new mongoose.Schema(
  {
    // Event information
    eventType: {
      type: String,
      required: true,
      enum: [
        // Authentication events
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'LOGOUT',
        'REGISTRATION',
        'PASSWORD_RESET_REQUEST',
        'PASSWORD_RESET_SUCCESS',
        'PASSWORD_CHANGE',
        'ADMIN_LOGIN_SUCCESS',
        'ADMIN_LOGIN_FAILED',
        
        // Data access events
        'DATA_ACCESS',
        'PROFILE_VIEW',
        'PROFILE_UPDATE',
        
        // Data modification events
        'DATA_CREATE',
        'DATA_UPDATE',
        'DATA_DELETE',
        
        // Product management
        'PRODUCT_CREATE',
        'PRODUCT_UPDATE',
        'PRODUCT_DELETE',
        
        // User management
        'USER_CREATE',
        'USER_UPDATE',
        'USER_DELETE',
        'ROLE_CHANGE',
        
        // Security events
        'UNAUTHORIZED_ACCESS',
        'PERMISSION_DENIED',
        'SUSPICIOUS_ACTIVITY',
        'BRUTE_FORCE_DETECTED',
        
        // System events
        'SYSTEM_ERROR',
        'CONFIGURATION_CHANGE',
      ],
      index: true,
    },
    
    // User information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      default: null,
    },
    userRole: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: null,
    },
    
    // Request information
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    requestMethod: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      default: null,
    },
    requestPath: {
      type: String,
      default: null,
    },
    
    // Event details
    description: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Resource information
    resourceType: {
      type: String,
      default: null, // e.g., 'user', 'product', 'order'
    },
    resourceId: {
      type: String,
      default: null,
    },
    
    // Status
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS',
      index: true,
    },
    
    // Security level
    securityLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for efficient querying
auditLogSchema.index({ createdAt: -1 }); // Most recent first
auditLogSchema.index({ eventType: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });
auditLogSchema.index({ securityLevel: 1, createdAt: -1 });

// Compound index for common queries
auditLogSchema.index({ eventType: 1, status: 1, createdAt: -1 });

const auditLogModel = mongoose.models.auditlog || mongoose.model("auditlog", auditLogSchema);

export default auditLogModel;
