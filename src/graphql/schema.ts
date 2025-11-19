import { baseType } from "./base.schema";
import { userType } from "../modules/user/user.schema";
import { authType } from "../modules/auth/auth.schema";

export const typeDefs = [
  baseType,
  userType,
  authType
];
