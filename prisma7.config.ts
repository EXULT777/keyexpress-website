import "dotenv/config";
import { defineConfig } from "prisma/config";
import { databaseUrl } from "./src/server/paths";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // The site keeps its database inside DATA_DIR rather than reading DATABASE_URL.
    url: databaseUrl(),
  },
});
