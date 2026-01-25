# 🔐 Role-Based Access Control (RBAC) Implementation Guide

## 📍 Where RBAC is Implemented in Your Codebase

---

## 1. **User Model - Role Definition**
**Location:** `backend/models/userModel.js`

```javascript
role: {
  type: String,
  enum: ['user', 'admin', 'moderator'],
  default: 'user',
}
```

**Available Roles:**
- `user` - Regular user (default)
- `admin` - Administrator (full access)
- `moderator` - Moderator (limited admin access)

---

## 2. **Authentication Middleware - Role Extraction**
**Location:** `backend/middleware/userAuth.js` (Lines 29-38)

```javascript
// Fetch user from database to get latest role
const user = await userModel.findById(userId);
if (!user) {
  return res.status(401).json({ success: false, message: "User not found." });
}

// Attach user info to request
req.userId = userId;
req.userRole = decodedToken.role || user.role || 'user';  // ← Role extracted here
req.user = user;
```

**What it does:**
- Extracts user role from JWT token or database
- Attaches `req.userRole` to request object
- Used by `roleAuth` middleware for authorization

---

## 3. **Role Authorization Middleware**
**Location:** `backend/middleware/roleAuth.js`

```javascript
const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user has required role
    const userRole = req.userRole || 'user';
    
    if (allowedRoles.includes(userRole)) {
      return next(); // Allow access
    }
    
    // Deny access
    return res.status(403).json({ 
      success: false, 
      message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}. Your current role is: ${userRole}.` 
    });
  };
};
```

**Usage Examples:**
- `roleAuth(['admin'])` - Only admin can access
- `roleAuth(['admin', 'moderator'])` - Admin or moderator can access
- `roleAuth(['user', 'admin', 'moderator'])` - All authenticated users can access

---

## 4. **Backend Routes - RBAC Protection**

### A. **User Routes** (`backend/routes/userRoute.js`)

```javascript
// Admin-only routes
userRouter.get("/all", adminAuth, roleAuth(['admin']), getAllUsers);
userRouter.post("/reset-admin-password", adminAuth, roleAuth(['admin']), resetAdminPassword);
```

**Protected Endpoints:**
- `GET /api/user/all` - Get all users (Admin only)
- `POST /api/user/reset-admin-password` - Reset admin password (Admin only)

---

### B. **Product Routes** (`backend/routes/productRoute.js`)

```javascript
// Admin-only routes
productRouter.post("/add", adminAuth, roleAuth(['admin']), upload.fields([...]), addProduct);
productRouter.post("/remove", adminAuth, roleAuth(['admin']), removeProduct);
productRouter.post("/update", adminAuth, roleAuth(['admin']), upload.fields([...]), updateProduct);
```

**Protected Endpoints:**
- `POST /api/product/add` - Add product (Admin only)
- `POST /api/product/remove` - Remove product (Admin only)
- `POST /api/product/update` - Update product (Admin only)

---

### C. **Contact Routes** (`backend/routes/contactRoute.js`)

```javascript
// Admin-only routes
contactRouter.get("/all", adminAuth, roleAuth(['admin']), getAllContacts);
contactRouter.put("/status/:id", adminAuth, roleAuth(['admin']), updateContactStatus);
contactRouter.delete("/delete/:id", adminAuth, roleAuth(['admin']), deleteContact);
```

**Protected Endpoints:**
- `GET /api/contact/all` - Get all contacts (Admin only)
- `PUT /api/contact/status/:id` - Update contact status (Admin only)
- `DELETE /api/contact/delete/:id` - Delete contact (Admin only)

---

### D. **Newsletter Routes** (`backend/routes/newsletterRoute.js`)

```javascript
// Admin-only routes
newsletterRouter.get("/all", adminAuth, roleAuth(['admin']), getAllSubscribers);
newsletterRouter.delete("/delete/:id", adminAuth, roleAuth(['admin']), deleteSubscriber);
```

**Protected Endpoints:**
- `GET /api/newsletter/all` - Get all subscribers (Admin only)
- `DELETE /api/newsletter/delete/:id` - Delete subscriber (Admin only)

---

### E. **Cart Routes** (`backend/routes/cartRoute.js`)

```javascript
// Admin-only route
cartRouter.post("/clear", adminAuth, roleAuth(['admin']), clearUserCart);
```

**Protected Endpoints:**
- `POST /api/cart/clear` - Clear user cart (Admin only)

---

## 5. **Controller-Level RBAC** 
**Location:** `backend/controllers/userController.js`

### Profile Access Control (Lines 157-182)

```javascript
const getProfile = async (req, res) => {
  const id = req.params.id;
  const userId = req.userId; // From userAuth middleware
  const userRole = req.userRole; // From userAuth middleware

  // Users can only view their own profile, unless they're admin
  if (id !== userId && userRole !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. You can only view your own profile." 
    });
  }
  // ... rest of code
}
```

**Logic:**
- Regular users can only view their own profile
- Admins can view any user's profile

### Profile Update Control (Lines 184-240)

```javascript
const updateProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  // Users can only update their own profile, unless they're admin
  if (id !== userId && userRole !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. You can only update your own profile." 
    });
  }
  // ... rest of code
}
```

**Logic:**
- Regular users can only update their own profile
- Admins can update any user's profile

---

## 6. **Frontend Route Protection**
**Location:** `frontend/src/components/ProtectedRoute.jsx`

```javascript
const ProtectedRoute = ({ children, allowedRoles = ['user'], redirectTo = '/login' }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;

  // Parse user data
  if (userStr) {
    user = JSON.parse(userStr);
  }

  // Check authentication
  if (!token || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role
  const userRole = user.role || 'user';
  
  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'admin') {
      window.location.href = '/admin';
      return null;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
```

**Usage in Routes:** `frontend/src/App.jsx` (Lines 42-71)

```javascript
{/* Protected Routes - User Role Required */}
<Route path='/profile' element={
  <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
    <Profile />
  </ProtectedRoute>
} />
<Route path='/cart' element={
  <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
    <Cart />
  </ProtectedRoute>
} />
<Route path='/place-order' element={
  <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
    <PlaceOrder />
  </ProtectedRoute>
} />
<Route path='/orders' element={
  <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
    <Orders />
  </ProtectedRoute>
} />
<Route path='/track-order/:productId?' element={
  <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
    <TrackOrder />
  </ProtectedRoute>
} />
<Route path='/favorites' element={
  <ProtectedRoute allowedRoles={['user', 'admin', 'moderator']}>
    <Favorites />
  </ProtectedRoute>
} />
```

**Protected Frontend Routes:**
- `/profile` - User profile page
- `/cart` - Shopping cart
- `/place-order` - Place order page
- `/orders` - User orders
- `/track-order` - Track order
- `/favorites` - User favorites

---

## 7. **Role Assignment**

### During Registration
**Location:** `backend/controllers/userController.js` (Lines 75-79)

```javascript
const newUser = new userModel({
  name,
  email,
  password: hashedPassword,
  // role defaults to 'user' (defined in schema)
});
```

### During Login
**Location:** `backend/controllers/userController.js` (Line 30)

```javascript
const token = createToken(user._id, user.role || 'user');
```

The role is included in the JWT token when user logs in.

---

## 📊 RBAC Summary

### Role Hierarchy
```
admin (Level 3) > moderator (Level 2) > user (Level 1)
```

### Permission Matrix

| Feature | User | Moderator | Admin |
|---------|------|-----------|-------|
| View Products | ✅ | ✅ | ✅ |
| Add to Cart | ✅ | ✅ | ✅ |
| Place Orders | ✅ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ |
| View All Users | ❌ | ❌ | ✅ |
| Add Products | ❌ | ❌ | ✅ |
| Delete Products | ❌ | ❌ | ✅ |
| View Contacts | ❌ | ❌ | ✅ |
| View Subscribers | ❌ | ❌ | ✅ |
| Clear User Cart | ❌ | ❌ | ✅ |

---

## 🔍 How to Test RBAC

### 1. **Test Admin Access**
```bash
# Login as admin
POST /api/user/admin
# Then try accessing admin routes
GET /api/user/all
```

### 2. **Test User Access**
```bash
# Login as regular user
POST /api/user/login
# Try accessing admin route (should fail with 403)
GET /api/user/all
```

### 3. **Test Frontend Protection**
- Login as regular user
- Try accessing `/profile` - Should work
- Try accessing admin panel - Should redirect

---

## 🛠️ How to Add New Role-Based Protection

### Backend Example:
```javascript
// In your route file
import roleAuth from "../middleware/roleAuth.js";

// Protect route with specific roles
router.get("/protected-route", userAuth, roleAuth(['admin', 'moderator']), yourController);
```

### Frontend Example:
```javascript
// In App.jsx
<Route path='/new-page' element={
  <ProtectedRoute allowedRoles={['admin']}>
    <NewPage />
  </ProtectedRoute>
} />
```

---

## 📝 Key Files Summary

1. **Role Definition:** `backend/models/userModel.js` (Line 22-26)
2. **Role Extraction:** `backend/middleware/userAuth.js` (Line 37)
3. **Role Authorization:** `backend/middleware/roleAuth.js` (Complete file)
4. **Backend Routes:** All files in `backend/routes/` using `roleAuth`
5. **Frontend Protection:** `frontend/src/components/ProtectedRoute.jsx`
6. **Frontend Routes:** `frontend/src/App.jsx` (Lines 42-71)
7. **Controller Logic:** `backend/controllers/userController.js` (Lines 157-240)

---

## ✅ Security Features Implemented

- ✅ Role-based route protection
- ✅ Role-based frontend page protection
- ✅ Controller-level permission checks
- ✅ Automatic role extraction from JWT
- ✅ Clear error messages for unauthorized access
- ✅ Role hierarchy support
- ✅ Multiple role support (array of allowed roles)
