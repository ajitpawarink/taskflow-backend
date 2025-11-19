import { AuthService } from "./auth.service";

const svc = new AuthService();

export const authResolvers = {
  Mutation: {
    register: async (_: any, { input }: any, ctx: any) => {
      const { user, accessToken, refreshTokenRaw } = await svc.register(input.name, input.email, input.password);
      // set httpOnly cookie
      console.log("Register resolver called");
      console.log("Access Token:", accessToken);
      console.log("Refresh Token Raw:", refreshTokenRaw);

      const cookieDomain = process.env.COOKIE_DOMAIN || "localhost";
      ctx.res.cookie("jid", refreshTokenRaw, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: cookieDomain,
        path: "/auth/refresh-token",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });
      return { token: accessToken, user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } };
    },

    login: async (_: any, { input }: any, ctx: any) => {
      const { user, accessToken, refreshTokenRaw } = await svc.login(input.email, input.password);
      const cookieDomain = process.env.COOKIE_DOMAIN || "localhost";
      ctx.res.cookie("jid", refreshTokenRaw, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: cookieDomain,
        path: "/auth/refresh-token",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
      return { token: accessToken, user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } };
    },
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
