# Security Features Implemented (MERN Project)

This document summarizes **what is implemented in this project** and **where it is implemented** in code.

## 1) Prevent unauthorized access to restricted pages / functions

- **Backend (authoritative)**
  - **User authentication middleware**: `backend/middleware/userAuth.js`
    - Accepts token from **cookie**, `headers.token`, or `Authorization: Bearer <token>`
    - Validates JWT + session rotation checks (`tv`, `jti`)
  - **Admin authentication middleware**: `backend/middleware/adminAuth.js`
    - Requires `role: "admin"` in JWT (fixes prior issue where any JWT could pass)
  - **Role-based access control (RBAC)**: `backend/middleware/roleAuth.js`
    - Used on admin-only routes
  - **IDOR fix (cart)**: `backend/controllers/cartController.js`
    - Prevents using someone else’s `userId` to read/modify cart

- **Frontend (UX only, not security)**
  - Route protection component: `frontend/src/components/ProtectedRoute.jsx`

## 2) Secure session management

- **httpOnly cookies + expiration**
  - Login/register/admin login set secure cookies: `backend/controllers/userController.js`
    - Cookie: `access_token` (**httpOnly**, **SameSite=Lax**, **Secure in prod**, **1 hour**)
    - Cookie: `csrf_token` (readable cookie used for CSRF header, **1 hour**)

- **Session rotation / anti-hijacking**
  - On login/register, server rotates a session id (`jti`) and stores its hash in DB:
    - `backend/controllers/userController.js`
    - User fields: `backend/models/userModel.js` (`tokenVersion`, `sessionIdHash`)
    - Admin fields: `backend/models/adminSettingsModel.js` (`tokenVersion`, `sessionIdHash`)

- **Logout**
  - Endpoints:
    - `POST /api/user/logout` (requires userAuth)
    - `POST /api/user/admin/logout` (requires adminAuth)
  - Implemented in: `backend/controllers/userController.js` + `backend/routes/userRoute.js`

- **CSRF protection (for cookie-auth)**
  - Middleware: `backend/middleware/csrfProtection.js`
  - Frontend sends `x-csrf-token` automatically:
    - `frontend/src/api/api.js`
    - `admin/src/api/api.js`

## 3) Data encryption

- **Passwords**: bcrypt hashing
  - `backend/controllers/userController.js`

- **Sensitive user fields at rest**: AES-256-GCM encryption
  - Utility: `backend/utils/encryption.js`
  - Model hooks: `backend/models/userModel.js`
  - Searchable deterministic lookup: `emailHash` (SHA-256)

- **Production safety**
  - Encryption now **fails closed in production** if `ENCRYPTION_KEY` is missing:
    - `backend/utils/encryption.js`
    - `backend/models/userModel.js`

## 4) Encrypted communication channel (HTTPS)

- HTTPS server entry point: `backend/server-https.js`
  - Includes HSTS and security headers
  - Includes CSRF protection and audit-log routes
  - Dev cert scripts:
    - `backend/generate-ssl-cert.ps1`
    - `backend/generate-ssl-cert.sh`

## 5) Audit logging

- Model: `backend/models/auditLogModel.js`
- Logger utility: `backend/utils/auditLogger.js`
- Admin-only API to view logs:
  - Routes: `backend/routes/auditLogRoute.js`
  - Controller: `backend/controllers/auditLogController.js`

## 6) Password security (complexity, reuse, expiry)

- **Password complexity enforced on backend**
  - Rules: upper/lower/digit/symbol + length
  - Code: `backend/utils/passwordPolicy.js` + `backend/controllers/userController.js`

- **Password reuse prevention**
  - Blocks reuse of last N passwords (default N=5)
  - User fields: `passwordHistory`
  - Admin fields: `passwordHistory`

- **Password expiry policy**
  - Default expiry: 90 days
  - Fields: `passwordChangedAt`, `passwordExpiresAt`

## 7) Brute-force prevention (rate limiting + lockout)

- In-memory protection (per IP + email + scope)
  - Config via env:
    - `MAX_LOGIN_ATTEMPTS` (default 5)
    - `LOGIN_WINDOW_MS` (default 15 minutes)
    - `LOGIN_LOCKOUT_MS` (default 15 minutes)
  - Code: `backend/middleware/bruteForceProtection.js`
  - Applied to:
    - `POST /api/user/login`
    - `POST /api/user/admin`

