import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Ye line .env file se variables load karti hai
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  // Path check karein ke folder ka naam 'schema' hi hai na
  schema: "./src/db/schema/app.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});