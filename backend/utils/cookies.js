import crypto from "crypto";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const CSRF_COOKIE = "csrf_token";

export function parseCookies(cookieHeader = "") {
  const cookies = {};
  if (!cookieHeader || typeof cookieHeader !== "string") return cookies;

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawKey, ...rest] = part.split("=");
    const key = rawKey?.trim();
    if (!key) continue;
    const value = rest.join("=").trim();
    cookies[key] = decodeURIComponent(value || "");
  }
  return cookies;
}

export function getTokenFromReq(req) {
  // Backward compatible:
  // - headers.token (existing code)
  // - Authorization: Bearer <token>
  // - cookie: access_token=<token>
  const headerToken = req.headers?.token;
  if (headerToken && typeof headerToken === "string") return headerToken;

  const auth = req.headers?.authorization;
  if (auth && typeof auth === "string") {
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m?.[1]) return m[1].trim();
  }

  const cookies = parseCookies(req.headers?.cookie || "");
  const cookieToken = cookies[ACCESS_TOKEN_COOKIE];
  if (cookieToken) return cookieToken;

  return null;
}

export function sha256Hex(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

