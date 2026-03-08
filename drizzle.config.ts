import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "./src/integrations/db/schemas/*.schema.ts",
  out: "./drizzle",
});
