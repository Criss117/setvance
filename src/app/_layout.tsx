import "../global.css";
import { StatusBar } from "react-native";
import "react-native-get-random-values";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Integrations } from "@/integrations";

export default function RootLayout() {
  const [accent, background] = useThemeColor(["accent", "background"]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Integrations>
        <StatusBar barStyle="light-content" backgroundColor={background} />
        <Stack
          screenOptions={{
            headerTintColor: accent,
            headerStyle: {
              backgroundColor: background,
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
