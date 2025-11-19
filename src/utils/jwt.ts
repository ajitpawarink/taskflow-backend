import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IUser } from "../modules/user/user.model";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

export const createAccessToken = (user: IUser) => {
  const payload = { id: user._id, email: user.email };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
};

// opaque refresh token generator (raw token returned, hash stored)
export const generateRefreshTokenPair = (): { raw: string; hash: string } => {
  const raw = crypto.randomBytes(64).toString("hex"); // 128 chars
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as any;
  } catch (err) {
    return null;
  }
};

// expiresAt date for refresh token
export const refreshTokenExpiryDate = (): Date => {
  const ms = msFromString(REFRESH_EXPIRES);
  return new Date(Date.now() + ms);
};

function msFromString(s: string) {
  // supports numbers like "15m", "30d"
  const num = parseInt(s.slice(0, -1), 10);
  const unit = s.slice(-1);
  switch (unit) {
    case "s": return num * 1000;
    case "m": return num * 60 * 1000;
    case "h": return num * 60 * 60 * 1000;
    case "d": return num * 24 * 60 * 60 * 1000;
    default: return parseInt(s, 10) * 1000;
  }
}
