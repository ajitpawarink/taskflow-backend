import express from "express";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import cors from "cors";

import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { buildContext } from "./graphql/context";
import { AuthService } from "./modules/auth/auth.service";

export const createApp = async () => {
  const app = express();

  app.use(cookieParser());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  // GraphQL endpoint
  app.use(
    "/graphql",
    cors({
      origin: true,
      credentials: true,
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => buildContext({ req, res }),
    })
  );

  const authService = new AuthService();

  // refresh token endpoint (rotate)
  app.post("/auth/refresh-token", async (req, res) => {
    try {
      const rawToken = req.cookies.jid || req.body.token;
      if (!rawToken) return res.status(401).json({ ok: false, accessToken: "" });

      const result = await authService.rotateRefreshToken(rawToken);
      if (!result) return res.status(401).json({ ok: false, accessToken: "" });

      // set new refresh token cookie
      const cookieDomain = process.env.COOKIE_DOMAIN || "localhost";
      res.cookie("jid", result.refreshTokenRaw, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: cookieDomain,
        path: "/auth/refresh-token",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });

      return res.json({ ok: true, accessToken: result.accessToken });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, accessToken: "" });
    }
  });

  // revoke token (logout)
  app.post("/auth/revoke", bodyParser.json(), async (req, res) => {
    try {
      const token = req.cookies.jid || req.body.token;
      if (token) await authService.revokeRefreshToken(token);
      res.clearCookie("jid", { path: "/auth/refresh-token", domain: process.env.COOKIE_DOMAIN || "localhost" });
      return res.json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false });
    }
  });

  // health
  app.get("/healthz", (_, res) => res.json({ status: "ok" }));

  return app;
};
