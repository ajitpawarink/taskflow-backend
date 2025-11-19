import { authResolvers } from "../models/auth/auth.resolver";
import { userResolvers } from "../models/user/user.resolver";

export const resolvers = {
  Query: {
    ...(authResolvers.Query || {}),
    ...(userResolvers.Query || {}),
  },
  Mutation: {
    ...(authResolvers.Mutation || {}),
    ...(userResolvers.Mutation || {}),
  },
};
