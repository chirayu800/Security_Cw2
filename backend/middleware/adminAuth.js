import jwt from "jsonwebtoken";
import adminSettingsModel from "../models/adminSettingsModel.js";
import { getTokenFromReq, sha256Hex } from "../utils/cookies.js";

const adminAuth = async (req, res, next) => {
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

    // Only allow admin role tokens
    if (typeof decodedToken !== "object" || decodedToken === null) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (decodedToken.role !== "admin" || !decodedToken.email) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const email = String(decodedToken.email).trim();

    // Verify admin identity (DB or env)
    const adminSettings = await adminSettingsModel.findOne({ email });
    if (!adminSettings && email !== (process.env.ADMIN_EMAIL || "").trim()) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    // Secure session checks
    const tokenVersion = decodedToken.tv;
    if (adminSettings && typeof tokenVersion === "number" && adminSettings.tokenVersion !== tokenVersion) {
      return res.status(401).json({ success: false, message: "Session expired. Please login again." });
    }
    const jti = decodedToken.jti;
    if (adminSettings && jti && adminSettings.sessionIdHash && sha256Hex(jti) !== adminSettings.sessionIdHash) {
      return res.status(401).json({ success: false, message: "Session invalid. Please login again." });
    }

    req.adminEmail = email;
    next();
  } catch (error) {
    console.log("Error while authenticating admin: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default adminAuth;
