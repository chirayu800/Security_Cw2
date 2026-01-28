import bcrypt from "bcrypt";

export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireLower: true,
  requireUpper: true,
  requireDigit: true,
  requireSymbol: true,
  historyCount: 5, // block reuse of last N passwords
  expiryDays: 90, // password expiry policy
};

export function validatePasswordComplexity(password) {
  if (typeof password !== "string") {
    return { ok: false, message: "Password must be a string" };
  }
  if (password.length < PASSWORD_POLICY.minLength) {
    return { ok: false, message: `Password must be at least ${PASSWORD_POLICY.minLength} characters` };
  }
  if (password.length > PASSWORD_POLICY.maxLength) {
    return { ok: false, message: `Password must be at most ${PASSWORD_POLICY.maxLength} characters` };
  }

  if (PASSWORD_POLICY.requireLower && !/[a-z]/.test(password)) {
    return { ok: false, message: "Password must include a lowercase letter" };
  }
  if (PASSWORD_POLICY.requireUpper && !/[A-Z]/.test(password)) {
    return { ok: false, message: "Password must include an uppercase letter" };
  }
  if (PASSWORD_POLICY.requireDigit && !/[0-9]/.test(password)) {
    return { ok: false, message: "Password must include a number" };
  }
  if (PASSWORD_POLICY.requireSymbol && !/[^a-zA-Z0-9]/.test(password)) {
    return { ok: false, message: "Password must include a symbol" };
  }

  return { ok: true, message: "OK" };
}

export function computePasswordExpiryDate(fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + PASSWORD_POLICY.expiryDays);
  return d;
}

export async function isPasswordReused(plainPassword, passwordHistory = [], currentHash = null) {
  // Check current hash first
  if (currentHash) {
    const same = await bcrypt.compare(plainPassword, currentHash);
    if (same) return true;
  }

  // Check last N history items
  const recent = Array.isArray(passwordHistory)
    ? passwordHistory.slice(-PASSWORD_POLICY.historyCount)
    : [];

  for (const entry of recent) {
    const hash = entry?.hash;
    if (!hash) continue;
    const same = await bcrypt.compare(plainPassword, hash);
    if (same) return true;
  }

  return false;
}

