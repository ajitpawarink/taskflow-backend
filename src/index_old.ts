import 'dotenv/config';
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";

import { typeDefs } from "./graphql/schema";
import { resolvers } from "./resolvers";
import { connectDB } from "./config/db"; // ✅ import the DB connection

import { buildContext } from "./graphql/context";

async function startServer() {
  await connectDB(); // ✅ connect to MongoDB first

  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });


  await server.start();

  //app.use("/graphql", cors(), bodyParser.json(), expressMiddleware(server));
  app.use(
    "/graphql",
    cors({
      origin: true,          // allow requests from any origin or specify your frontend
      credentials: true,     // allow cookies to be sent
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => buildContext({ req, res }), // ✅ user will be set here
    })
  );

  app.listen(4000, () => {
    console.log("🚀 Server running at http://localhost:4000/graphql");
  });
}

startServer();