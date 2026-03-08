import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { auditMetadata, SESSION_STATE, uuid, WORKOUT_STATE } from "./utils";
import { exercise } from "./exercise.schema";
import { templateExercise } from "./template.schema";

export const trainingSession = sqliteTable(
  "training_session",
  {
    id: uuid("id").primaryKey(),

    startTimestamp: integer("start_timestamp", {
      mode: "timestamp_ms",
    }).notNull(),
    endTimestamp: integer("end_timestamp", {
      mode: "timestamp_ms",
    }),

    sessionState: text("session_state", {
      enum: SESSION_STATE.list,
    }).notNull(),

    notes: text("notes", {
      length: 225,
    }),

    ...auditMetadata,
  },
  (t) => [
    check(
      "training_session_notes_length_lte_225",
      sql`length(${t.notes}) <= 225`,
    ),
  ],
);

export const workoutSession = sqliteTable(
  "workout_session",
  {
    id: uuid("id").primaryKey(),

    sessionId: text("session_id")
      .notNull()
      .references(() => trainingSession.id, {
        onDelete: "cascade",
      }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercise.id, {
        onDelete: "no action",
      }),
    templateExerciseId: text("template_exercise_id").references(
      () => templateExercise.id,
      { onDelete: "set null" },
    ),

    startTimestamp: integer("start_timestamp", {
      mode: "timestamp_ms",
    }).notNull(),
    endTimestamp: integer("end_timestamp", {
      mode: "timestamp_ms",
    }),

    workoutIndex: integer("workout_index").notNull(),
    workoutState: text("workout_state", {
      enum: WORKOUT_STATE.list,
    }).notNull(),

    notes: text("notes", {
      length: 225,
    }),

    targetSets: integer("target_sets").notNull(),
    targetRepsMin: integer("target_reps_min").notNull(),
    targetRepsMax: integer("target_reps_max").notNull(),
    oneErmMax: integer("one_erm_max").notNull().default(0),

    ...auditMetadata,
  },
  (t) => [
    index("workout_session_one_erm_max_idx").on(t.oneErmMax),
    index("workout_session_session_id_idx").on(t.sessionId),
    index("workout_session_exercise_id_idx").on(t.exerciseId),
    index("workout_session_template_exercise_id_idx").on(t.templateExerciseId),

    check(
      "workout_session_notes_length_lte_225",
      sql`length(${t.notes}) <= 225`,
    ),
    check(
      "workout_session_workout_index_gte_zero",
      sql`${t.workoutIndex} >= 0`,
    ),
    check("workout_session_target_sets_gt_zero", sql`${t.targetSets} > 0`),
    check(
      "workout_session_target_reps_min_gt_zero",
      sql`${t.targetRepsMin} > 0`,
    ),
    check(
      "workout_session_target_reps_min_lte_target_reps_max",
      sql`${t.targetRepsMin} <= ${t.targetRepsMax}`,
    ),
    check(
      "workout_session_target_reps_max_gt_zero",
      sql`${t.targetRepsMax} > 0`,
    ),
    check(
      "workout_session_target_reps_max_gte_target_reps_min",
      sql`${t.targetRepsMax} >= ${t.targetRepsMin}`,
    ),
    check("workout_session_one_erm_max_gte_zero", sql`${t.oneErmMax} >= 0`),
  ],
);

export const setExercise = sqliteTable(
  "set_exercise",
  {
    id: uuid("id").primaryKey(),
    workoutSessionId: text("workout_session_id")
      .notNull()
      .references(() => workoutSession.id, {
        onDelete: "cascade",
      }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercise.id, {
        onDelete: "cascade",
      }),

    setIndex: integer("set_index").notNull(),

    weightLifted: real("weight_lifted").notNull(),
    repsPerformed: integer("reps_performed").notNull(),

    rpeValue: integer("rpe_value").notNull(),
    restActual: integer("rest_actual").notNull(),
    oneErm: integer("one_erm").notNull(),
    isUnplanned: integer("is_unplanned", {
      mode: "boolean",
    })
      .notNull()
      .default(false),

    ...auditMetadata,
  },
  (t) => [
    index("set_exercise_one_erm_idx").on(t.oneErm),
    index("set_exercise_workout_session_id_idx").on(t.workoutSessionId),
    index("set_exercise_exercise_id_idx").on(t.exerciseId),

    check("set_exercise_set_index_gte_zero", sql`${t.setIndex} >= 0`),
    check("set_exercise_weight_lifted_gt_zero", sql`${t.weightLifted} > 0`),
    check("set_exercise_reps_performed_gt_zero", sql`${t.repsPerformed} > 0`),
    check("set_exercise_rpe_value_gt_zero", sql`${t.rpeValue} > 0`),
    check("set_exercise_rpe_value_lte_zero", sql`${t.rpeValue} <= 10`),
    check("set_exercise_rest_actual_gt_zero", sql`${t.restActual} > 0`),
    check("set_exercise_1erm_gt_zero", sql`${t.oneErm} > 0`),
  ],
);
