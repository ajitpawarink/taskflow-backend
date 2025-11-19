import { userResolvers } from "../models/user/user.resolver";
import { authResolvers } from "../models/auth/auth.resolver";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...authResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...authResolvers.Mutation,
  },
};
