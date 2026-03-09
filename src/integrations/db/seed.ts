import { db } from ".";
import { exercise, InsertExercise } from "./schemas/exercise.schema";

const DEFAULT_EXERCISES: InsertExercise[] = [
  {
    name: "Press Banca con Mancuerna",
    equipment: "mancuernas",
    isUnilateral: false,
    muscleGroup: "Pectorales",
    imageUrl: "https://picsum.photos/200/300",
  },
  {
    name: "Sentadilla Goblet",
    equipment: "mancuernas",
    isUnilateral: false,
    muscleGroup: "Cuádriceps",
    imageUrl: "https://picsum.photos/200/301",
  },
  {
    name: "Remo con Mancuerna a una mano",
    equipment: "mancuernas",
    isUnilateral: true,
    muscleGroup: "Espalda",
    imageUrl: "https://picsum.photos/200/302",
  },
  {
    name: "Press Militar con Barra",
    equipment: "barra",
    isUnilateral: false,
    muscleGroup: "Hombros",
    imageUrl: "https://picsum.photos/200/303",
  },
  {
    name: "Peso Muerto Rumano",
    equipment: "barra",
    isUnilateral: false,
    muscleGroup: "Isquiotibiales",
    imageUrl: "https://picsum.photos/200/304",
  },
  {
    name: "Zancadas Laterales",
    equipment: "peso corporal",
    isUnilateral: true,
    muscleGroup: "Glúteos",
    imageUrl: "https://picsum.photos/200/200",
  },
  {
    name: "Curl de Bíceps con Barra EZ",
    equipment: "barra",
    isUnilateral: false,
    muscleGroup: "Bíceps",
    imageUrl: "https://picsum.photos/200/200",
  },
  {
    name: "Extensiones de Tríceps en Polea Alta",
    equipment: "polea",
    isUnilateral: false,
    muscleGroup: "Tríceps",
    imageUrl: "https://picsum.photos/200/200",
  },
  {
    name: "Elevaciones de Talones de pie",
    equipment: "mancuernas",
    isUnilateral: false,
    muscleGroup: "Gemelos",
    imageUrl: "https://picsum.photos/200/200",
  },
  {
    name: "Plancha Abdominal",
    equipment: "peso corporal",
    isUnilateral: false,
    muscleGroup: "Abdominales",
    imageUrl: "https://picsum.photos/200/200",
  },
];
export async function seedExercises() {
  const existing = await db.select().from(exercise).limit(1);
  if (existing.length > 0) return;

  await db.insert(exercise).values(DEFAULT_EXERCISES);
  console.log("✅ Datos por defecto insertados");
}
