import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";

export default function TabsLayout() {
  const accentForeground = useThemeColor("accent-foreground");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: accentForeground,
        },
        tabBarStyle: {
          backgroundColor: accentForeground,
          borderColor: "transparent",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Home",
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          headerTitle: "Categories",
        }}
      />
    </Tabs>
  );
}
