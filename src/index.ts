import "dotenv/config";
import { connectDB } from "./config/db";
import { createApp } from "./app"; // import your modular app

const PORT = process.env.PORT || 4000;

async function startServer() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Create the app (Express + Apollo + routes)
  const app = await createApp();

  // 3. Start listening
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
