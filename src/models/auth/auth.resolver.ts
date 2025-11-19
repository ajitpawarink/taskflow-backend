import { AuthService } from "./auth.service";

const svc = new AuthService();

export const authResolvers = {
  Mutation: {
    
  },

  Query: {
    me: async (_: any, __: any, ctx: any) => {
      // ctx.user is set by context builder (from access token)
      if (!ctx.user) return null;
      const { User } = require("../user/user.model");
      const user = await User.findById(ctx.user.id).lean();
      if (!user) return null;
      return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
    },
  },
};
