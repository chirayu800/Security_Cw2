import { ACCESS_TOKEN_COOKIE, CSRF_COOKIE, parseCookies } from "../utils/cookies.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Double-submit cookie CSRF protection:
// - Server sets a readable cookie: csrf_token
// - Client must send the same value in header: x-csrf-token
// - Only enforced when auth is cookie-based (access_token cookie present)
const csrfProtection = (req, res, next) => {
  try {
    if (SAFE_METHODS.has(req.method)) return next();

    // Skip CSRF on authentication endpoints (they don't rely on existing auth cookie)
    const p = req.path || "";
    if (
      p === "/api/user/login" ||
      p === "/api/user/register" ||
      p === "/api/user/admin" ||
      p === "/api/user/forgot-password" ||
      p === "/api/user/reset-password"
    ) {
      return next();
    }

    const cookies = parseCookies(req.headers?.cookie || "");
    const hasAuthCookie = Boolean(cookies[ACCESS_TOKEN_COOKIE]);
    if (!hasAuthCookie) return next(); // header-token auth is not CSRF vulnerable

    const cookieCsrf = cookies[CSRF_COOKIE];
    const headerCsrf = req.headers?.["x-csrf-token"];

    if (!cookieCsrf || !headerCsrf || String(cookieCsrf) !== String(headerCsrf)) {
      return res.status(403).json({
        success: false,
        message: "CSRF validation failed",
      });
    }

    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: "CSRF middleware error" });
  }
};

export default csrfProtection;

