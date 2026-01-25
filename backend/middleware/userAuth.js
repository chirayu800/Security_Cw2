import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { getTokenFromReq, sha256Hex } from "../utils/cookies.js";

// Middleware to authenticate regular users
const userAuth = async (req, res, next) => {
  try {
    const token = getTokenFromReq(req);

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized! Token is required." });
    }

    // Decode and verify the token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.log("JWT verification error:", jwtError.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token. Please login again." });
    }

    // Extract user ID from token (can be id field or old format)
    const userId = decodedToken.id || decodedToken._id || decodedToken;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid token format." });
    }

    // Fetch user from database to get latest role
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    // Secure session checks (protect against hijacking/fixation)
    // - tokenVersion invalidates tokens after password reset/logout
    // - sessionIdHash invalidates older sessions (single active session per user)
    const tokenVersion = decodedToken.tv;
    if (typeof tokenVersion === "number" && user.tokenVersion !== tokenVersion) {
      return res.status(401).json({ success: false, message: "Session expired. Please login again." });
    }
    const jti = decodedToken.jti;
    if (jti && user.sessionIdHash && sha256Hex(jti) !== user.sessionIdHash) {
      return res.status(401).json({ success: false, message: "Session invalid. Please login again." });
    }

    // Attach user info to request
    req.userId = userId;
    req.userRole = decodedToken.role || user.role || 'user';
    req.user = user;
    

    next();
  } catch (error) {
    console.log("Error while authenticating user: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default userAuth;
