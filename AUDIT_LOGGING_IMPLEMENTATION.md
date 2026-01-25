# 📋 Audit Logging Implementation Guide

## Overview

Comprehensive audit logging system has been implemented to track all security-relevant events, user actions, and system changes. This provides a complete audit trail for compliance and security monitoring.

---

## ✅ What's Being Logged

### Authentication Events
- ✅ **LOGIN_SUCCESS** - Successful user login
- ✅ **LOGIN_FAILED** - Failed login attempts
- ✅ **LOGOUT** - User logout (can be added)
- ✅ **REGISTRATION** - New user registration
- ✅ **PASSWORD_RESET_REQUEST** - Password reset requested
- ✅ **PASSWORD_RESET_SUCCESS** - Password reset completed
- ✅ **PASSWORD_CHANGE** - Password changed
- ✅ **ADMIN_LOGIN_SUCCESS** - Successful admin login
- ✅ **ADMIN_LOGIN_FAILED** - Failed admin login attempts

### Authorization Events
- ✅ **UNAUTHORIZED_ACCESS** - Unauthorized access attempts
- ✅ **PERMISSION_DENIED** - Permission denied due to role restrictions

### Data Access Events
- ✅ **DATA_ACCESS** - Access to sensitive data
- ✅ **PROFILE_VIEW** - Profile viewed
- ✅ **PROFILE_UPDATE** - Profile updated

### Data Modification Events
- ✅ **DATA_CREATE** - Data created
- ✅ **DATA_UPDATE** - Data updated
- ✅ **DATA_DELETE** - Data deleted

### Security Events
- ✅ **SUSPICIOUS_ACTIVITY** - Suspicious activity detected
- ✅ **BRUTE_FORCE_DETECTED** - Brute force attack detected

---

## 📍 Implementation Files

### 1. **Audit Log Model**
**File:** `backend/models/auditLogModel.js`

**Fields:**
- `eventType` - Type of event (enum)
- `userId` - User who performed the action
- `userEmail` - User email
- `userRole` - User role
- `ipAddress` - Client IP address
- `userAgent` - Browser/client information
- `requestMethod` - HTTP method (GET, POST, etc.)
- `requestPath` - API endpoint accessed
- `description` - Human-readable description
- `details` - Additional event details
- `resourceType` - Type of resource affected
- `resourceId` - ID of resource affected
- `status` - SUCCESS, FAILURE, or WARNING
- `securityLevel` - LOW, MEDIUM, HIGH, or CRITICAL
- `metadata` - Additional metadata
- `createdAt` - Timestamp

**Indexes:**
- Created for efficient querying by date, event type, user, IP, status, and security level

---

### 2. **Audit Logger Utility**
**File:** `backend/utils/auditLogger.js`

**Functions:**
- `createAuditLog()` - Create custom audit log entry
- `logAuthEvent()` - Log authentication events
- `logDataAccess()` - Log data access
- `logDataModification()` - Log data modifications
- `logSecurityEvent()` - Log security events
- `logUnauthorizedAccess()` - Log unauthorized access
- `logPermissionDenied()` - Log permission denied

---

### 3. **Audit Log Controller**
**File:** `backend/controllers/auditLogController.js`

**Endpoints:**
- `GET /api/audit-logs` - Get all audit logs (with filtering)
- `GET /api/audit-logs/stats` - Get audit log statistics
- `GET /api/audit-logs/critical` - Get critical security events
- `GET /api/audit-logs/:id` - Get single audit log
- `DELETE /api/audit-logs/old` - Delete old audit logs

---

### 4. **Audit Log Routes**
**File:** `backend/routes/auditLogRoute.js`

**Protection:**
- All routes require admin authentication
- All routes require admin role

---

## 🔍 Where Audit Logging is Active

### User Controller (`backend/controllers/userController.js`)
- ✅ User login (success/failure)
- ✅ User registration
- ✅ Profile updates
- ✅ Password reset requests
- ✅ Password reset success
- ✅ Admin login (success/failure)
- ✅ Admin password changes
- ✅ Unauthorized profile access attempts

### Role Authorization Middleware (`backend/middleware/roleAuth.js`)
- ✅ Permission denied events
- ✅ Unauthorized access attempts

---

## 📊 API Endpoints

### Get All Audit Logs
```
GET /api/audit-logs?page=1&limit=50&eventType=LOGIN_FAILED&status=FAILURE
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `eventType` - Filter by event type
- `status` - Filter by status (SUCCESS, FAILURE, WARNING)
- `securityLevel` - Filter by security level
- `userId` - Filter by user ID
- `ipAddress` - Filter by IP address
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `search` - Search in description, email, IP, or path

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "pages": 20
  }
}
```

---

### Get Audit Log Statistics
```
GET /api/audit-logs/stats?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5000,
    "success": 4500,
    "failure": 400,
    "critical": 100,
    "eventTypeStats": [...],
    "statusStats": [...],
    "securityLevelStats": [...]
  }
}
```

---

### Get Critical Events
```
GET /api/audit-logs/critical?limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 20
}
```

---

### Get Single Audit Log
```
GET /api/audit-logs/:id
```

---

### Delete Old Audit Logs
```
DELETE /api/audit-logs/old?days=90
```

**Query Parameters:**
- `days` - Delete logs older than X days (default: 90)

**⚠️ Use with caution - this permanently deletes logs!**

---

## 🔒 Security Features

### 1. **Access Control**
- ✅ All audit log endpoints require admin authentication
- ✅ All audit log endpoints require admin role
- ✅ Regular users cannot access audit logs

### 2. **Data Protection**
- ✅ IP addresses logged for security monitoring
- ✅ User agents logged for device tracking
- ✅ Request paths logged for activity tracking
- ✅ Timestamps for all events

### 3. **Security Levels**
- **LOW** - Normal operations (data access)
- **MEDIUM** - Standard operations (login, updates)
- **HIGH** - Important operations (password changes, deletes)
- **CRITICAL** - Security events (unauthorized access, failures)

---

## 📈 Usage Examples

### View Recent Failed Login Attempts
```bash
GET /api/audit-logs?eventType=LOGIN_FAILED&status=FAILURE&limit=20
```

### View All Critical Security Events
```bash
GET /api/audit-logs/critical
```

### View Activity for Specific User
```bash
GET /api/audit-logs?userId=507f1f77bcf86cd799439011
```

### View Activity from Specific IP
```bash
GET /api/audit-logs?ipAddress=192.168.1.100
```

### View Activity in Date Range
```bash
GET /api/audit-logs?startDate=2024-01-01&endDate=2024-01-31
```

### Get Statistics for Last Month
```bash
GET /api/audit-logs/stats?startDate=2024-01-01&endDate=2024-01-31
```

---

## 🧪 Testing Audit Logging

### Test Login Logging
1. Try to login with wrong password
2. Check audit logs: `GET /api/audit-logs?eventType=LOGIN_FAILED`
3. Should see failed login attempt logged

### Test Permission Denied Logging
1. Login as regular user
2. Try to access admin endpoint
3. Check audit logs: `GET /api/audit-logs?eventType=PERMISSION_DENIED`
4. Should see permission denied event logged

### Test Registration Logging
1. Register a new user
2. Check audit logs: `GET /api/audit-logs?eventType=REGISTRATION`
3. Should see registration event logged

---

## 📝 Adding More Audit Logging

### Example: Log Product Creation
```javascript
import { logDataModification } from "../utils/auditLogger.js";

// In product controller
await logDataModification(
  'PRODUCT_CREATE',
  'product',
  product._id.toString(),
  `Product created: ${product.name}`,
  req,
  req.user,
  { productName: product.name, price: product.price }
);
```

### Example: Log Custom Event
```javascript
import { createAuditLog } from "../utils/auditLogger.js";

await createAuditLog({
  eventType: 'CUSTOM_EVENT',
  description: 'Custom event description',
  req,
  user: req.user,
  status: 'SUCCESS',
  securityLevel: 'MEDIUM',
  details: { customData: 'value' }
});
```

---

## 🗄️ Database Storage

### Collection Name
- `auditlogs` (MongoDB collection)

### Indexes
- `createdAt` (descending) - For recent-first queries
- `eventType` + `createdAt` - For event type queries
- `userId` + `createdAt` - For user activity queries
- `ipAddress` + `createdAt` - For IP-based queries
- `status` + `createdAt` - For status-based queries
- `securityLevel` + `createdAt` - For security level queries

### Storage Considerations
- Audit logs can grow large over time
- Use `DELETE /api/audit-logs/old?days=90` to clean up old logs
- Consider archiving old logs instead of deleting
- Monitor database size

---

## 🔧 Configuration

### Environment Variables
No additional environment variables needed - audit logging works out of the box!

### Optional: Customize Security Levels
Edit `backend/utils/auditLogger.js` to adjust security levels for different events.

---

## ✅ Checklist

- [x] Audit log model created
- [x] Audit logger utility created
- [x] Authentication events logged
- [x] Authorization events logged
- [x] Data modification events logged
- [x] Admin endpoints for viewing logs
- [x] Filtering and pagination
- [x] Statistics endpoint
- [x] Critical events endpoint
- [x] Security access control

---

## 🎯 Summary

Your application now has comprehensive audit logging that tracks:
- ✅ All authentication events
- ✅ All authorization failures
- ✅ All data modifications
- ✅ All security events
- ✅ User activity
- ✅ IP addresses and user agents
- ✅ Timestamps for all events

**All audit logs are accessible via admin-only API endpoints!**

---

## 📚 Next Steps

1. **View Audit Logs:**
   - Use admin panel or API to view logs
   - Monitor for suspicious activity
   - Review failed login attempts

2. **Set Up Alerts:**
   - Monitor critical security events
   - Set up notifications for suspicious activity
   - Review logs regularly

3. **Compliance:**
   - Audit logs help with compliance requirements
   - Keep logs for required retention period
   - Export logs for external audits if needed
