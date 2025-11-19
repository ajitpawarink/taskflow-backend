import { userResolvers } from "../modules/user/user.resolver";
import { authResolvers } from "../modules/auth/auth.resolver";

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
