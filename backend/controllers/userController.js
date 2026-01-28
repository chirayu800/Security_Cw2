import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { ACCESS_TOKEN_COOKIE, CSRF_COOKIE, randomToken, sha256Hex } from "../utils/cookies.js";
import {
  computePasswordExpiryDate,
  isPasswordReused,
  validatePasswordComplexity,
} from "../utils/passwordPolicy.js";
import userModel from "../models/userModel.js";
import adminSettingsModel from "../models/adminSettingsModel.js";
import { logAuthEvent } from "../utils/auditLogger.js";
import { recordLoginResult } from "../middleware/bruteForceProtection.js";

// INFO: Function to create token with role
const createToken = (payload) => {
  // Short-lived access token + rotation metadata
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const cookieOptions = (req) => {
  const isProd = process.env.NODE_ENV === "production";
  // If behind proxy/https, req.secure can be true when trust proxy is enabled
  const secure = isProd || Boolean(req.secure);
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  };
};

const setAuthCookies = (req, res, accessToken) => {
  const opts = cookieOptions(req);

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...opts, maxAge: 60 * 60 * 1000 });


  const csrf = randomToken(16);
  res.cookie(CSRF_COOKIE, csrf, {
    ...opts,
    httpOnly: false,
    maxAge: 60 * 60 * 1000,
  });
};

const clearAuthCookies = (req, res) => {
  const opts = cookieOptions(req);
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...opts });
  res.clearCookie(CSRF_COOKIE, { ...opts, httpOnly: false });
};

// INFO: Route for user login
const loginUser = async (req, res) => {
  console.log("=== LOGIN ATTEMPT ===");
  console.log("Email received:", req.body.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Normalize email (same as registration)
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Normalized email:", normalizedEmail);

    const user = await userModel.findByEmail(normalizedEmail);
    console.log("User found:", user ? "Yes" : "No");
    if (user) {
      console.log("User ID:", user._id);
      console.log("User email (decrypted):", user.email);
      console.log("User has password:", !!user.password);
      console.log("Password hash length:", user.password ? user.password.length : 0);
    } else {
      console.log("❌ User not found in database!");
      console.log("Trying to find user with email:", normalizedEmail);
    }

    if (!user) {
      // Log failed login attempt (user not found)
      await logAuthEvent(
        'LOGIN_FAILED',
        `Failed login attempt - user not found: ${email}`,
        req,
        null,
        'FAILURE'
      );

      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Password expiry policy
    if (user.passwordExpiresAt && user.passwordExpiresAt instanceof Date && user.passwordExpiresAt < new Date()) {
      await logAuthEvent(
        "PASSWORD_EXPIRED",
        `Password expired for: ${email}`,
        req,
        { email: normalizedEmail },
        "FAILURE"
      );
      await recordLoginResult(req, { success: false, eventEmail: normalizedEmail });
      return res.status(403).json({
        success: false,
        message: "Password expired. Please reset your password.",
      });
    }

    // Verify password exists
    if (!user.password) {
      console.error("ERROR: User password is missing in database!");
      return res.status(500).json({
        success: false,
        message: "Internal server error. Please contact support."
      });
    }

    console.log("Comparing password...");
    console.log("Input password length:", password.length);
    console.log("Stored password hash:", user.password ? user.password.substring(0, 20) + "..." : "MISSING");

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log("❌ Password mismatch!");
      console.log("This might be due to:");
      console.log("1. Wrong password entered");
      console.log("2. Password hash mismatch in database");
      console.log("3. Password was not hashed correctly during registration");
    }

    if (isPasswordCorrect) {
      // Rotate session id to prevent session fixation/hijacking
      const jti = randomToken(16);
      const tv = typeof user.tokenVersion === "number" ? user.tokenVersion : 0;
      await userModel.findByIdAndUpdate(user._id, { sessionIdHash: sha256Hex(jti) });

      const token = createToken({ id: user._id, role: user.role || "user", jti, tv });

      // User from findByEmail is already decrypted, but we need to ensure password is removed
      // and return a clean user object
      const userResponse = {
        _id: user._id,
        name: user.name, // Already decrypted by findByEmail
        email: user.email, // Already decrypted by findByEmail
        role: user.role || 'user',
        cartData: user.cartData || {},
        isAdmin: user.isAdmin || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      // Log successful login
      await logAuthEvent(
        'LOGIN_SUCCESS',
        `User ${email} logged in successfully`,
        req,
        userResponse,
        'SUCCESS'
      );

      // Secure session cookies (httpOnly + expiry)
      res.setHeader("Cache-Control", "no-store");
      setAuthCookies(req, res, token);
      await recordLoginResult(req, { success: true, eventEmail: normalizedEmail });
      res.status(200).json({ success: true, token, user: userResponse });
    } else {
      // Log failed login attempt
      await logAuthEvent(
        'LOGIN_FAILED',
        `Failed login attempt for email: ${email}`,
        req,
        null,
        'FAILURE'
      );

      await recordLoginResult(req, { success: false, eventEmail: normalizedEmail });
      res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error while logging in user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for user registration
const registerUser = async (req, res) => {
  console.log(req.body)
  try {
    const { name, email, password } = req.body;

    // INFO: Check if user already exists (using encryption-aware method)
    const userExists = await userModel.findByEmail(email);
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // INFO: Validating email and password
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const complexity = validatePasswordComplexity(password);
    if (!complexity.ok) {
      return res.status(400).json({ success: false, message: complexity.message });
    }

    // INFO: Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // INFO: Normalize email (same as login)
    const normalizedEmail = email.toLowerCase().trim();
    console.log("=== REGISTRATION ===");
    console.log("Email:", email);
    console.log("Normalized email:", normalizedEmail);
    console.log("Password hash created:", hashedPassword.substring(0, 20) + "...");

    // INFO: Create new user
    const now = new Date();
    const newUser = new userModel({
      name,
      email: normalizedEmail, // Use normalized email
      password: hashedPassword,
      passwordChangedAt: now,
      passwordExpiresAt: computePasswordExpiryDate(now),
      passwordHistory: [{ hash: hashedPassword, changedAt: now }],
    });

    // INFO: Save user to database
    const user = await newUser.save();
    console.log("✅ User saved to database successfully!");
    console.log("User ID:", user._id);
    console.log("User emailHash (✅ VISIBLE in MongoDB Compass):", user.emailHash || "MISSING");
    console.log("User email in DB (🔒 encrypted):", user.email ? user.email.substring(0, 30) + "..." : "MISSING");
    console.log("User name (🔒 encrypted):", user.name ? user.name.substring(0, 30) + "..." : "MISSING");
    console.log("User password (🔒 hashed):", user.password ? user.password.substring(0, 20) + "..." : "MISSING");
    console.log("User role (✅ VISIBLE):", user.role || "user");
    console.log("📊 MongoDB Compass View:");
    console.log("   📁 Collection: 'users'");
    console.log("   ✅ Visible fields: _id, emailHash, role, cartData, isAdmin, createdAt, updatedAt");
    console.log("   🔒 Encrypted fields: email, name");
    console.log("   🔒 Hashed field: password");
    console.log("   👉 Open MongoDB Compass → Your Database → 'users' collection to see this user!");

    // INFO: Create token with role
    // Rotate session id to prevent session fixation/hijacking
    const jti = randomToken(16);
    const tv = typeof user.tokenVersion === "number" ? user.tokenVersion : 0;
    await userModel.findByIdAndUpdate(user._id, { sessionIdHash: sha256Hex(jti) });

    const token = createToken({ id: user._id, role: user.role || "user", jti, tv });

    // Get user with decrypted fields using findByEmail (which handles decryption)
    const userResponse = await userModel.findByEmail(email);

    // Create clean user object without password
    const cleanUser = userResponse ? {
      _id: userResponse._id,
      name: userResponse.name, // Already decrypted by findByEmail
      email: userResponse.email, // Already decrypted by findByEmail
      role: userResponse.role || 'user',
      cartData: userResponse.cartData || {},
      isAdmin: userResponse.isAdmin || false,
      createdAt: userResponse.createdAt,
      updatedAt: userResponse.updatedAt,
    } : {
      _id: user._id,
      name: name, // Use original name since email was just registered
      email: email, // Use original email since it was just registered
      role: user.role || 'user',
      cartData: user.cartData || {},
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Log user registration
    await logAuthEvent(
      'REGISTRATION',
      `New user registered: ${email}`,
      req,
      cleanUser,
      'SUCCESS'
    );

    // INFO: Return success response with decrypted user data
    res.setHeader("Cache-Control", "no-store");
    setAuthCookies(req, res, token);
    res.status(200).json({ success: true, token, user: cleanUser });
  } catch (error) {
    console.log("Error while registering user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Admin login attempt - Email:", email);
    console.log("Environment ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    console.log("Environment ADMIN_PASSWORD exists:", !!process.env.ADMIN_PASSWORD);

    // Check database first
    let adminSettings = await adminSettingsModel.findOne({ email });

    // If no admin settings in DB, check environment variables and create DB entry
    if (!adminSettings) {
      console.log("No admin settings in DB, checking environment variables");
      const envEmail = process.env.ADMIN_EMAIL?.trim();
      const envPassword = process.env.ADMIN_PASSWORD?.trim();
      const inputEmail = email?.trim();
      const inputPassword = password?.trim();

      if (
        envEmail &&
        envPassword &&
        inputEmail === envEmail &&
        inputPassword === envPassword
      ) {
        console.log("Environment variables match, creating DB entry");
        // Create admin settings in database with hashed password
        const complexity = validatePasswordComplexity(inputPassword);
        if (!complexity.ok) {
          return res.status(400).json({ success: false, message: complexity.message });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(inputPassword, salt);

        const now = new Date();
        adminSettings = new adminSettingsModel({
          email: envEmail,
          password: hashedPassword,
          passwordChangedAt: now,
          passwordExpiresAt: computePasswordExpiryDate(now),
          passwordHistory: [{ hash: hashedPassword, changedAt: now }],
        });
        await adminSettings.save();

        const jti = randomToken(16);
        const tv = typeof adminSettings.tokenVersion === "number" ? adminSettings.tokenVersion : 0;
        adminSettings.sessionIdHash = sha256Hex(jti);
        await adminSettings.save();

        const token = createToken({ email: envEmail, role: "admin", jti, tv });

        // Log admin login
        await logAuthEvent(
          'ADMIN_LOGIN_SUCCESS',
          `Admin logged in: ${envEmail}`,
          req,
          { email: envEmail, role: 'admin' },
          'SUCCESS'
        );

        res.setHeader("Cache-Control", "no-store");
        setAuthCookies(req, res, token);
        await recordLoginResult(req, { success: true, eventEmail: envEmail });
        return res.status(200).json({ success: true, token });
      } else {
        console.log("Environment variables don't match");

        // Log failed admin login
        await logAuthEvent(
          'ADMIN_LOGIN_FAILED',
          `Failed admin login attempt: ${email}`,
          req,
          null,
          'FAILURE'
        );
        await recordLoginResult(req, { success: false, eventEmail: email });
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }
    }

    // Password expiry policy (admin)
    if (adminSettings.passwordExpiresAt && adminSettings.passwordExpiresAt instanceof Date && adminSettings.passwordExpiresAt < new Date()) {
      await logAuthEvent(
        "ADMIN_PASSWORD_EXPIRED",
        `Admin password expired: ${email}`,
        req,
        { email },
        "FAILURE"
      );
      await recordLoginResult(req, { success: false, eventEmail: email });
      return res.status(403).json({ success: false, message: "Password expired. Please change/reset admin password." });
    }

    // Verify password from database
    console.log("Admin settings found in DB, verifying password");
    const isPasswordCorrect = await bcrypt.compare(password, adminSettings.password);

    if (isPasswordCorrect) {
      const jti = randomToken(16);
      const tv = typeof adminSettings.tokenVersion === "number" ? adminSettings.tokenVersion : 0;
      adminSettings.sessionIdHash = sha256Hex(jti);
      await adminSettings.save();

      const token = createToken({ email: adminSettings.email, role: "admin", jti, tv });

      // Log successful admin login
      await logAuthEvent(
        'ADMIN_LOGIN_SUCCESS',
        `Admin logged in: ${adminSettings.email}`,
        req,
        { email: adminSettings.email, role: 'admin' },
        'SUCCESS'
      );

      res.setHeader("Cache-Control", "no-store");
      setAuthCookies(req, res, token);
      await recordLoginResult(req, { success: true, eventEmail: adminSettings.email });
      res.status(200).json({ success: true, token });
    } else {
      console.log("Password verification failed");

      // Log failed admin login
      await logAuthEvent(
        'ADMIN_LOGIN_FAILED',
        `Failed admin login attempt: ${email}`,
        req,
        null,
        'FAILURE'
      );

      await recordLoginResult(req, { success: false, eventEmail: adminSettings.email });
      res.status(400).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error while logging in admin: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
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

    const user = await userModel.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.log("Error while fetching profile: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// INFO: Route for updating user profile
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const userId = req.userId; // From userAuth middleware
    const userRole = req.userRole; // From userAuth middleware

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Users can only update their own profile, unless they're admin
    if (id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own profile."
      });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate email if provided
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await userModel.findByEmail(email.toLowerCase());
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();

    await user.save();

    // Return user without password
    const updatedUser = await userModel.findById(id).select('-password');

    // Log profile update
    await logAuthEvent(
      'PROFILE_UPDATE',
      `Profile updated for user ${id}`,
      req,
      updatedUser,
      'SUCCESS'
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.log("Error while updating profile: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// INFO: Route for getting all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("Error while fetching all users: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// INFO: Route for resetting admin password (for debugging/initial setup)
const resetAdminPassword = async (req, res) => {
  try {
    // Delete all admin settings to reset
    await adminSettingsModel.deleteMany({});
    res.status(200).json({
      success: true,
      message: "Admin settings reset. You can now login with environment variables."
    });
  } catch (error) {
    console.log("Error while resetting admin password: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// INFO: Route for changing admin password
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword, email } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const complexity = validatePasswordComplexity(newPassword);
    if (!complexity.ok) {
      return res.status(400).json({ success: false, message: complexity.message });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Get admin email from request or environment variable
    const adminEmail = email || process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      return res.status(400).json({ success: false, message: "Admin email not found" });
    }

    // Find admin settings
    let adminSettings = await adminSettingsModel.findOne({ email: adminEmail });

    // If no admin settings in DB, check environment variables
    if (!adminSettings) {
      if (currentPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }

      // Create admin settings with new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const now = new Date();
      adminSettings = new adminSettingsModel({
        email: adminEmail,
        password: hashedPassword,
        passwordChangedAt: now,
        passwordExpiresAt: computePasswordExpiryDate(now),
        passwordHistory: [{ hash: hashedPassword, changedAt: now }],
      });
      adminSettings.tokenVersion = (adminSettings.tokenVersion || 0) + 1;
      adminSettings.sessionIdHash = null;
      await adminSettings.save();

      return res.status(200).json({ success: true, message: "Password changed successfully" });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, adminSettings.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const reused = await isPasswordReused(newPassword, adminSettings.passwordHistory, adminSettings.password);
    if (reused) {
      return res.status(400).json({ success: false, message: "You cannot reuse a recent password." });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    adminSettings.password = hashedPassword;
    const now = new Date();
    adminSettings.passwordChangedAt = now;
    adminSettings.passwordExpiresAt = computePasswordExpiryDate(now);
    adminSettings.passwordHistory = [...(adminSettings.passwordHistory || []), { hash: hashedPassword, changedAt: now }].slice(-5);
    adminSettings.tokenVersion = (adminSettings.tokenVersion || 0) + 1;
    adminSettings.sessionIdHash = null;
    await adminSettings.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log("Error while changing admin password: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


// INFO: Route for requesting password reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset token has been generated."
      });
    }

    // Generate reset token (simple 6-digit code for demo)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token expires in 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // In production, send email with reset token
    // For demo purposes, we'll return the token (remove this in production!)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    // Log password reset request
    await logAuthEvent(
      'PASSWORD_RESET_REQUEST',
      `Password reset requested for: ${email}`,
      req,
      user,
      'SUCCESS'
    );

    res.status(200).json({
      success: true,
      message: "Password reset token generated. Check your email (or console for demo).",
      resetToken: resetToken // Remove this in production - only for demo
    });
  } catch (error) {
    console.log("Error in forgot password: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Route for resetting password with token
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token, and new password are required"
      });
    }

    const complexity = validatePasswordComplexity(newPassword);
    if (!complexity.ok) {
      return res.status(400).json({ success: false, message: complexity.message });
    }

    // IMPORTANT: email is stored encrypted; use encryption-aware lookup
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }
    if (user.resetPasswordToken !== resetToken || !user.resetPasswordExpires || user.resetPasswordExpires <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const reused = await isPasswordReused(newPassword, user.passwordHistory, user.password);
    if (reused) {
      return res.status(400).json({ success: false, message: "You cannot reuse a recent password." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    const now = new Date();
    user.passwordChangedAt = now;
    user.passwordExpiresAt = computePasswordExpiryDate(now);
    user.passwordHistory = [...(user.passwordHistory || []), { hash: hashedPassword, changedAt: now }].slice(-5);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    // Invalidate active sessions after password reset
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.sessionIdHash = null;
    await user.save();

    // Log successful password reset
    await logAuthEvent(
      'PASSWORD_RESET_SUCCESS',
      `Password reset successful for: ${email}`,
      req,
      user,
      'SUCCESS'
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.log("Error in reset password: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// INFO: Logout (clears cookies and invalidates session)
const logoutUser = async (req, res) => {
  try {
    clearAuthCookies(req, res);
    if (req.userId) {
      await userModel.findByIdAndUpdate(req.userId, {
        $inc: { tokenVersion: 1 },
        $set: { sessionIdHash: null },
      });
    }
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    clearAuthCookies(req, res);
    const email = req.adminEmail || (process.env.ADMIN_EMAIL || "").trim();
    if (email) {
      await adminSettingsModel.findOneAndUpdate(
        { email },
        { $inc: { tokenVersion: 1 }, $set: { sessionIdHash: null } },
        { upsert: false }
      );
    }
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export {
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
};
