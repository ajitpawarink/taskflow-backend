import { User } from "./user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Not authenticated");

      return await User.findById(context.user.id);
    },
    users: async () => {
      const users = await User.find().lean();
      return users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
      }));
    },
  },

  Mutation: {
    register: async (_: any, { input }: any) => {
      const { name, email, password } = input;

      // Check existing user
      const existing = await User.findOne({ email });
      if (existing) throw new Error("Email already registered......");

      // Encrypt password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return { token, user };
    },

    login: async (_: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid credentials");

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return { token, user };
    },
  },
};
