import { logAuthEvent } from "../utils/auditLogger.js";

// Simple in-memory brute-force protection (per-process).
// For production multi-instance deployments, store this in Redis.

const MAX_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
const WINDOW_MS = Number(process.env.LOGIN_WINDOW_MS || 15 * 60 * 1000); 
const LOCKOUT_MS = Number(process.env.LOGIN_LOCKOUT_MS || 15 * 60 * 1000); 

const store = new Map(); // key -> { count, firstAt, lockUntil }

function now() {
  return Date.now();
}

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function getClientIp(req) {
  // trust proxy enabled in server.js / server-https.js
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length > 0) return xf.split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function getKey(req, scope = "user") {
  const ip = getClientIp(req);
  const email = normalizeEmail(req.body?.email);
  // Include scope to avoid cross-contamination between user/admin
  return `${scope}:${ip}:${email || "-"}`;
}

function getEntry(key) {
  const e = store.get(key);
  if (!e) return null;

  // Expire old windows automatically
  if (e.firstAt && now() - e.firstAt > WINDOW_MS && (!e.lockUntil || now() > e.lockUntil)) {
    store.delete(key);
    return null;
  }
  return e;
}

function setEntry(key, entry) {
  store.set(key, entry);
}

export function protectLogin(scope = "user") {
  return async (req, res, next) => {
    try {
      const key = getKey(req, scope);
      req._bfKey = key;
      req._bfScope = scope;

      const entry = getEntry(key);
      if (entry?.lockUntil && now() < entry.lockUntil) {
        const remainingSec = Math.ceil((entry.lockUntil - now()) / 1000);
        try {
          await logAuthEvent(
            scope === "admin" ? "ADMIN_LOGIN_LOCKED" : "LOGIN_LOCKED",
            `Login blocked (lockout). Remaining ${remainingSec}s`,
            req,
            { key, remainingSec, scope },
            "FAILURE"
          );
        } catch {
          // ignore logging failures
        }
        return res.status(429).json({
          success: false,
          message: `Too many attempts. Try again in ${remainingSec} seconds.`,
        });
      }

      next();
    } catch (e) {
      next();
    }
  };
}

export async function recordLoginResult(req, { success, eventEmail }) {
  const key = req?._bfKey;
  const scope = req?._bfScope || "user";
  if (!key) return;

  if (success) {
    // Successful login resets attempts
    store.delete(key);
    return;
  }

  const entry = getEntry(key) || { count: 0, firstAt: now(), lockUntil: null };
  const withinWindow = now() - entry.firstAt <= WINDOW_MS;

  if (!withinWindow) {
    entry.count = 0;
    entry.firstAt = now();
    entry.lockUntil = null;
  }

  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockUntil = now() + LOCKOUT_MS;
    try {
      await logAuthEvent(
        scope === "admin" ? "ADMIN_LOGIN_LOCKED" : "LOGIN_LOCKED",
        `Account temporarily locked after ${entry.count} failed attempts`,
        req,
        { key, scope, attempts: entry.count, email: normalizeEmail(eventEmail || req.body?.email) },
        "FAILURE"
      );
    } catch {
      // ignore logging failures
    }
  }

  setEntry(key, entry);
}

