import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import { BottomTabs } from "@shared/components/bottom-tabs";
import { CreateExercise } from "@exercises/presentation/components/create-exercise";
import { View } from "react-native";

export default function TabsLayout() {
  const [accent, background] = useThemeColor(["accent", "background"]);

  return (
    <Tabs
      tabBar={(props) => <BottomTabs {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: background,
        },
        headerTitleStyle: {
          color: accent,
          fontSize: 24,
        },
        sceneStyle: {
          backgroundColor: background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Sesiones",
        }}
      />

      <Tabs.Screen
        name="templates"
        options={{
          title: "Plantillas",
          headerTitle: "Mis rutinas",
        }}
      />

      <Tabs.Screen
        name="exercises"
        options={{
          title: "Ejercicios",
          headerRight: () => (
            <View className="mx-2">
              <CreateExercise />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
