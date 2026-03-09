import { use } from "react";
import { FlatList, Image, View } from "react-native";
import { db } from "@/integrations/db";
import {
  exercise,
  SelectExercise,
} from "@/integrations/db/schemas/exercise.schema";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";

import { desc } from "drizzle-orm";

function ShowExercises({ promise }: { promise: Promise<SelectExercise[]> }) {
  const data = use(promise);

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card className="flex-1 mx-2 p-0 relative">
          <View className="absolute z-50 right-2 top-2">
            <Chip size="sm">{item.muscleGroup}</Chip>
          </View>
          <Image src={item.imageUrl} className="aspect-square rounded-t-xl" />
          <Card.Header className="px-4 py-1">
            <Card.Title className="line-clamp-2 text-base">
              {item.name}
            </Card.Title>
          </Card.Header>
        </Card>
      )}
      contentContainerClassName="flex gap-5 px-1 pb-24"
    />
  );
}

export default function Exercises() {
  const exercisesPromise = db
    .select()
    .from(exercise)
    .orderBy(desc(exercise.createdAt))
    .execute();

  return <ShowExercises promise={exercisesPromise} />;
}
