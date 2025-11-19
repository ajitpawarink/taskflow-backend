import { User } from "../user/user.model";
import { IUser } from "../../types/models/user";
import argon2 from "argon2";
import { createAccessToken, generateRefreshTokenPair, refreshTokenExpiryDate } from "../../utils/jwt";

export class AuthService {
  async register(name: string, email: string, password: string) {
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already registered");

    const hashed = await argon2.hash(password);
    const user = await User.create({ name, email, password: hashed });

    const accessToken = createAccessToken(user);
    const { raw, hash } = generateRefreshTokenPair();
    const expiresAt = refreshTokenExpiryDate();
    user.refreshTokens.push({ tokenHash: hash, createdAt: new Date(), expiresAt });
    await user.save();

    return { user, accessToken, refreshTokenRaw: raw, refreshTokenExpiresAt: expiresAt };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new Error("Invalid credentials");

    const accessToken = createAccessToken(user);
    const { raw, hash } = generateRefreshTokenPair();
    const expiresAt = refreshTokenExpiryDate();
    user.refreshTokens.push({ tokenHash: hash, createdAt: new Date(), expiresAt });
    // prune old tokens (optional): keep only recent N or only those not expired
    user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > new Date());
    await user.save();

    return { user, accessToken, refreshTokenRaw: raw, refreshTokenExpiresAt: expiresAt };
  }

  // verify incoming refresh token (raw), rotate -> issue new pair
  async rotateRefreshToken(rawToken: string) {
    const hash = require("crypto").createHash("sha256").update(rawToken).digest("hex");
    // find user with this refresh token
    const user = await User.findOne({ "refreshTokens.tokenHash": hash }) as IUser | null;
    if (!user) return null;

    // find token entry
    const idx = user.refreshTokens.findIndex(rt => rt.tokenHash === hash);
    if (idx === -1) return null;

    const tokenEntry = user.refreshTokens[idx];
    if (tokenEntry.expiresAt <= new Date()) {
      // expired: remove it
      user.refreshTokens.splice(idx, 1);
      await user.save();
      return null;
    }

    // rotate: remove old token and add new one
    user.refreshTokens.splice(idx, 1);
    const { raw: newRaw, hash: newHash } = generateRefreshTokenPair();
    const expiresAt = refreshTokenExpiryDate();
    user.refreshTokens.push({ tokenHash: newHash, createdAt: new Date(), expiresAt });
    await user.save();

    const accessToken = createAccessToken(user);
    return { user, accessToken, refreshTokenRaw: newRaw, refreshTokenExpiresAt: expiresAt };
  }

  async revokeRefreshToken(rawToken: string) {
    const hash = require("crypto").createHash("sha256").update(rawToken).digest("hex");
    const user = await User.findOne({ "refreshTokens.tokenHash": hash });
    if (!user) return false;
    user.refreshTokens = user.refreshTokens.filter(rt => rt.tokenHash !== hash);
    await user.save();
    return true;
  }

  async revokeAllForUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) return false;
    user.refreshTokens = [];
    await user.save();
    return true;
  }
}
