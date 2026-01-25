// Role-based authorization middleware
// Usage: roleAuth(['admin', 'moderator']) - allows admin or moderator
//        roleAuth(['admin']) - allows only admin

import { logPermissionDenied } from "../utils/auditLogger.js";

// Role hierarchy: admin > moderator > user
const roleHierarchy = {
  'admin': 3,
  'moderator': 2,
  'user': 1
};

const roleAuth = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Check if userAuth or adminAuth middleware was called first
      if (!req.userRole && !req.adminEmail) {
        return res.status(401).json({ 
          success: false, 
          message: "Authentication required. Please login first." 
        });
      }

      // For admin panel (uses adminAuth)
      if (req.adminEmail) {
        // Admin from admin panel has 'admin' role by default
        if (allowedRoles.includes('admin')) {
          return next();
        }
        
        // Log permission denied (non-blocking)
        logPermissionDenied(req, { email: req.adminEmail, role: 'admin' }, {
          requiredRoles: allowedRoles,
          attemptedPath: req.path,
        }).catch(err => console.error('Audit log error:', err));
        
        return res.status(403).json({ 
          success: false, 
          message: "Access denied. Admin role required." 
        });
      }

      // For regular users (uses userAuth)
      const userRole = req.userRole || 'user';
      
      // Check if user role is in allowed roles
      if (allowedRoles.includes(userRole)) {
        return next();
      }

      // Log permission denied (non-blocking)
      logPermissionDenied(req, req.user || { role: userRole }, {
        requiredRoles: allowedRoles,
        userRole: userRole,
        attemptedPath: req.path,
      }).catch(err => console.error('Audit log error:', err));

      // Return specific error message based on role
      const userRoleLevel = roleHierarchy[userRole] || 0;
      const requiredRoleLevel = Math.max(...allowedRoles.map(role => roleHierarchy[role] || 0));
      
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}. Your current role is: ${userRole}.` 
      });
    } catch (error) {
      console.log("Error in role authorization: ", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

export default roleAuth;
