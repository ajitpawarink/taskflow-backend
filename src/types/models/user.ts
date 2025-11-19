import { Document } from "mongoose";

export interface IRefreshToken {
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}
export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // hashed
  refreshTokens: IRefreshToken[];
  createdAt: Date;
}