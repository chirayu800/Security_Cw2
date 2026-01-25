/**
 * Audit Logger Utility
 * Centralized logging for security events and user actions
 */

import auditLogModel from "../models/auditLogModel.js";

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    'unknown'
  );
};

/**
 * Get user agent from request
 */
const getClientUserAgent = (req) => {
  return req.headers['user-agent'] || null;
};

/**
 * Create an audit log entry
 * @param {Object} options - Audit log options
 * @param {string} options.eventType - Type of event
 * @param {string} options.description - Description of the event
 * @param {Object} options.req - Express request object (optional)
 * @param {Object} options.user - User object (optional)
 * @param {string} options.status - Status: 'SUCCESS', 'FAILURE', 'WARNING'
 * @param {string} options.securityLevel - Security level: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
 * @param {string} options.resourceType - Type of resource affected
 * @param {string} options.resourceId - ID of resource affected
 * @param {Object} options.details - Additional details
 * @param {Object} options.metadata - Additional metadata
 */
export const createAuditLog = async ({
  eventType,
  description,
  req = null,
  user = null,
  status = 'SUCCESS',
  securityLevel = 'MEDIUM',
  resourceType = null,
  resourceId = null,
  details = {},
  metadata = {},
}) => {
  try {
    // Extract information from request
    const ipAddress = req ? getClientIP(req) : 'system';
    const userAgent = req ? getClientUserAgent(req) : null;
    const requestMethod = req ? req.method : null;
    const requestPath = req ? req.originalUrl || req.path : null;

    // Extract user information
    const userId = user?._id || user?.id || req?.userId || null;
    const userEmail = user?.email || req?.user?.email || null;
    const userRole = user?.role || req?.userRole || null;

    // Create audit log entry
    const auditLog = new auditLogModel({
      eventType,
      description,
      userId,
      userEmail,
      userRole,
      ipAddress,
      userAgent,
      requestMethod,
      requestPath,
      resourceType,
      resourceId,
      status,
      securityLevel,
      details,
      metadata: {
        ...metadata,
        timestamp: new Date(),
      },
    });

    // Save to database (non-blocking)
    auditLog.save().catch((error) => {
      console.error('Failed to save audit log:', error);
      // Don't throw - audit logging should not break the application
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${eventType}: ${description}`, {
        user: userEmail || 'anonymous',
        ip: ipAddress,
        status,
      });
    }

    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logging should not break the application
    return null;
  }
};

/**
 * Log authentication events
 */
export const logAuthEvent = async (eventType, description, req, user = null, status = 'SUCCESS') => {
  const securityLevel = status === 'FAILURE' ? 'HIGH' : 'MEDIUM';
  
  return createAuditLog({
    eventType,
    description,
    req,
    user,
    status,
    securityLevel,
    details: {
      timestamp: new Date(),
    },
  });
};

/**
 * Log data access events
 */
export const logDataAccess = async (resourceType, resourceId, req, user) => {
  return createAuditLog({
    eventType: 'DATA_ACCESS',
    description: `Accessed ${resourceType} with ID: ${resourceId}`,
    req,
    user,
    resourceType,
    resourceId,
    securityLevel: 'LOW',
    details: {
      resourceType,
      resourceId,
    },
  });
};

/**
 * Log data modification events
 */
export const logDataModification = async (
  eventType,
  resourceType,
  resourceId,
  description,
  req,
  user,
  details = {}
) => {
  const securityLevel = eventType.includes('DELETE') ? 'HIGH' : 'MEDIUM';
  
  return createAuditLog({
    eventType,
    description,
    req,
    user,
    resourceType,
    resourceId,
    securityLevel,
    details: {
      resourceType,
      resourceId,
      ...details,
    },
  });
};

/**
 * Log security events
 */
export const logSecurityEvent = async (eventType, description, req, user = null, details = {}) => {
  return createAuditLog({
    eventType,
    description,
    req,
    user,
    status: 'WARNING',
    securityLevel: 'CRITICAL',
    details,
  });
};

/**
 * Log unauthorized access attempts
 */
export const logUnauthorizedAccess = async (req, user = null, details = {}) => {
  return createAuditLog({
    eventType: 'UNAUTHORIZED_ACCESS',
    description: `Unauthorized access attempt to ${req.path}`,
    req,
    user,
    status: 'FAILURE',
    securityLevel: 'CRITICAL',
    details: {
      path: req.path,
      method: req.method,
      ...details,
    },
  });
};

/**
 * Log permission denied events
 */
export const logPermissionDenied = async (req, user, details = {}) => {
  return createAuditLog({
    eventType: 'PERMISSION_DENIED',
    description: `Permission denied for user ${user?.email || 'unknown'} to access ${req.path}`,
    req,
    user,
    status: 'FAILURE',
    securityLevel: 'HIGH',
    details: {
      path: req.path,
      method: req.method,
      userRole: user?.role,
      ...details,
    },
  });
};

// Export default
export default {
  createAuditLog,
  logAuthEvent,
  logDataAccess,
  logDataModification,
  logSecurityEvent,
  logUnauthorizedAccess,
  logPermissionDenied,
};
