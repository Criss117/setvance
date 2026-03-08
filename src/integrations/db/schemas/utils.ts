import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";

export function uuid(name = "id") {
  return text(name).$defaultFn(() => v7());
}

export const auditMetadata = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  // isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
};

export const SESSION_STATE = {
  PENDING: "PENDING",
  ON_PROGRESS: "ON_PROGRESS",
  COMPLETE: "COMPLETE",
  list: ["PENDING", "ON_PROGRESS", "COMPLETE"],
} as const;

export const WORKOUT_STATE = {
  PENDING: "PENDING",
  ON_PROGRESS: "ON_PROGRESS",
  COMPLETE: "COMPLETE",
  list: ["PENDING", "ON_PROGRESS", "COMPLETE"],
} as const;
