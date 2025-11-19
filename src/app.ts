// src/app.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { buildContext } from "./graphql/context";
import { AuthService } from "./modules/auth/auth.service";
import { getTokenFromRequest } from "./middlewares/auth";

export const createApp = async () => {
  const app = express();

  // Parse cookies
  app.use(cookieParser());

  // CORS and body parsing
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(bodyParser.json());

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();
  app.use("/graphql", expressMiddleware(server, { context: ({ req, res }) => buildContext({ req, res }) }));

  // AuthService instance
  const authService = new AuthService();

  // Refresh token endpoint
  app.post("/auth/refresh-token", async (req, res) => {
    try {
      const rawToken = getTokenFromRequest(req);
      if (!rawToken) return res.status(401).json({ ok: false, accessToken: "" });

      const result = await authService.rotateRefreshToken(rawToken);
      if (!result) return res.status(401).json({ ok: false, accessToken: "" });

      // Set new refresh token cookie
      const cookieDomain = process.env.COOKIE_DOMAIN || "localhost";
      res.cookie("jid", result.refreshTokenRaw, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: cookieDomain,
        path: "/auth/refresh-token",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });

      return res.json({ ok: true, accessToken: result.accessToken });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, accessToken: "" });
    }
  });

  // Revoke token (logout) endpoint
  app.post("/auth/revoke", async (req, res) => {
    try {
      const rawToken = getTokenFromRequest(req);
      if (rawToken) await authService.revokeRefreshToken(rawToken);

      res.clearCookie("jid", {
        path: "/auth/refresh-token",
        domain: process.env.COOKIE_DOMAIN || "localhost",
      });

      return res.json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false });
    }
  });

  // Health check
  app.get("/healthz", (_, res) => res.json({ status: "ok" }));

  return app;
};
