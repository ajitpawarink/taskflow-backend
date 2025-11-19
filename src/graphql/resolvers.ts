import { authResolvers } from "../modules/auth/auth.resolver";

export const resolvers = {
  Query: {
    ...(authResolvers.Query || {}),
  },
  Mutation: {
    ...(authResolvers.Mutation || {}),
  },
};
