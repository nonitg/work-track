import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "wt_auth";
const MAX_AGE_DAYS = 90;

function getSecret(): string {
  const s = process.env.COOKIE_SECRET;
  if (!s) throw new Error("COOKIE_SECRET is not set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function makeAuthToken(): string {
  const issued = Date.now().toString();
  const sig = sign(issued);
  return `${issued}.${sig}`;
}

export function verifyAuthToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const expected = sign(issued);
  try {
    if (sig.length !== expected.length) return false;
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return false;
    }
  } catch {
    return false;
  }
  const ageMs = Date.now() - Number(issued);
  if (!Number.isFinite(ageMs) || ageMs < 0) return false;
  if (ageMs > MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return false;
  return true;
}

export const AUTH_COOKIE = COOKIE_NAME;
export const AUTH_MAX_AGE_SECONDS = MAX_AGE_DAYS * 24 * 60 * 60;
