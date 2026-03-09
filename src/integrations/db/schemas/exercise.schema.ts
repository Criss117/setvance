import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditMetadata, uuid } from "./utils";

export const exercise = sqliteTable(
  "exercise",
  {
    id: uuid().primaryKey(),
    name: text("name").notNull(),
    muscleGroup: text("muscle_group").notNull(),
    equipment: text("equipment").notNull(),
    isUnilateral: integer("is_unilateral", {
      mode: "boolean",
    }).notNull(),
    imageUrl: text("image_url"),

    ...auditMetadata,
  },
  (t) => [
    index("exercise_name_idx").on(t.name),
    index("exercise_muscle_group_idx").on(t.muscleGroup),
  ],
);

export type InsertExercise = typeof exercise.$inferInsert;
export type SelectExercise = typeof exercise.$inferSelect;
