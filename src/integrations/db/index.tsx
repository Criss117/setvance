import { useEffect } from "react";
import { Text, View } from "react-native";
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../../drizzle/migrations";
import { LoadingApp } from "@shared/components/loading-app";

let _db: ReturnType<typeof drizzle> | null = null;

function getDB() {
  if (!_db) {
    const expo = SQLite.openDatabaseSync("db.db");
    // WAL mode para mejor rendimiento en escrituras concurrentes
    expo.execSync("PRAGMA journal_mode = WAL;");
    _db = drizzle(expo);
  }
  return _db;
}

export const db = getDB();

export function DBProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (__DEV__ && success) {
      console.log("[DB] Migrations applied successfully");
    }
  }, [success]);

  if (error) {
    if (__DEV__) console.error("[DB] Migration error:", error);
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) return <LoadingApp message={"Aplicando migraciones..."} />;

  return <>{children}</>;
}
