import { verifyAccessToken } from "../utils/jwt";

export const buildContext = async ({ req, res }: any) => {
  const auth = req.headers.authorization || "";
  let user = null;
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.replace("Bearer ", "");
    const decoded = verifyAccessToken(token);
    if (decoded) user = decoded;
  }
  return { req, res, user };
};
