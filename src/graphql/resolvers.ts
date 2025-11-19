import { authResolvers } from "../models/auth/auth.resolver";

export const resolvers = {
  Query: {
    ...(authResolvers.Query || {}),
  },
  Mutation: {
    ...(authResolvers.Mutation || {}),
  },
};
