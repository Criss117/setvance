import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { auditMetadata, uuid } from "./utils";
import { exercise } from "./exercise.schema";

export const workoutTemplate = sqliteTable(
  "workout_template",
  {
    id: uuid("id").primaryKey(),
    name: text("name", {
      length: 100,
    }).notNull(),
    description: text("description", {
      length: 225,
    }),

    ...auditMetadata,
  },
  (t) => [
    index("workout_template_name_idx").on(t.name),

    check(
      "workout_template_description_length_lte_225",
      sql`length(${t.description}) <= 225`,
    ),
  ],
);

export const templateExercise = sqliteTable(
  "template_exercise",
  {
    id: uuid("id").primaryKey(),
    workoutTemplateId: text("workout_template_id")
      .notNull()
      .references(() => workoutTemplate.id, {
        onDelete: "cascade",
      }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercise.id, {
        onDelete: "cascade",
      }),

    targetSets: integer("target_sets").notNull(),
    targetRepsMin: integer("target_reps_min").notNull(),
    targetRepsMax: integer("target_reps_max").notNull(),
    targetRestTime: integer("target_rest_time").notNull(),
    exerciseIndex: integer("exercise_index").notNull(),

    ...auditMetadata,
  },
  (t) => [
    index("template_exercise_workout_template_id_idx").on(t.workoutTemplateId),
    index("template_exercise_exercise_id_idx").on(t.exerciseId),

    unique("template_exercise_exercise_index_unq").on(
      t.exerciseIndex,
      t.exerciseId,
      t.workoutTemplateId,
    ),

    check("template_exercise_target_sets_gt_zero", sql`${t.targetSets} > 0`),

    check(
      "template_exercise_target_reps_min_gt_zero",
      sql`${t.targetRepsMin} > 0`,
    ),
    check(
      "template_exercise_target_reps_min_lte_target_reps_max",
      sql`${t.targetRepsMin} <= ${t.targetRepsMax}`,
    ),

    check(
      "template_exercise_target_reps_max_gt_zero",
      sql`${t.targetRepsMax} > 0`,
    ),
    check(
      "template_exercise_target_reps_max_gte_target_reps_min",
      sql`${t.targetRepsMax} >= ${t.targetRepsMin}`,
    ),

    check(
      "template_exercise_target_rest_time_gt_zero",
      sql`${t.targetRestTime} > 0`,
    ),
  ],
);

export const recurrenceConfig = sqliteTable(
  "recurrence_config",
  {
    id: uuid("id").primaryKey(),
    workoutTemplateId: text("workout_template_id")
      .notNull()
      .references(() => workoutTemplate.id, {
        onDelete: "cascade",
      }),

    frequency: text("frequency").notNull(),
    interval: integer("interval").notNull(),

    daysOfWeek: text("days_of_week"),
    endCondition: text("end_condition"),
    endValue: text("end_value"),
  },
  (t) => [
    index("recurrence_config_workout_template_id_idx").on(t.workoutTemplateId),
  ],
);
