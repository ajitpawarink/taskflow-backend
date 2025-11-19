import mongoose, { Schema, Document } from "mongoose";

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

const RefreshTokenSchema = new Schema<IRefreshToken>({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshTokens: { type: [RefreshTokenSchema], default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
