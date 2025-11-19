import { baseType } from "./base.schema";
import { userType } from "../models/user/user.schema";
import { authType } from "../models/auth/auth.schema";

export const typeDefs = [
  baseType,
  userType,
  authType
];
