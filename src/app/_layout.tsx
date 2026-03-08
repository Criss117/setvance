import "../global.css";
import { StatusBar } from "react-native";
import "react-native-get-random-values";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Integrations } from "@/integrations";

export default function RootLayout() {
  const [accent, accentForeground] = useThemeColor([
    "accent",
    "accent-foreground",
  ]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Integrations>
        <StatusBar
          barStyle="light-content"
          backgroundColor={accentForeground}
        />
        <Stack
          screenOptions={{
            headerTintColor: accent,
            headerStyle: {
              backgroundColor: accentForeground,
            },
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </Integrations>
    </GestureHandlerRootView>
  );
}
