import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ MongoDB connected successfully (Atlas)");
  } catch (err) {
    console.error("❌ MongoDB connection failed");
    console.error(err);
    process.exit(1);
  }
};
