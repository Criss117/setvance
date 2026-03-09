import { View } from "react-native";
import { useThemeColor } from "heroui-native/hooks";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Popover } from "heroui-native/popover";
import { Button } from "heroui-native/button";
import { cn } from "tailwind-variants";

import { MaterialIcons } from "../lib/with-uniwind";
import { UIText } from "./ui-text";

function getIconByRouteName(routeName: string, color: string) {
  switch (routeName) {
    case "index":
      return (
        <MaterialIcons name="play-circle-outline" size={20} color={color} />
      );
    case "exercises":
      return <MaterialIcons name="fitness-center" size={20} color={color} />;
    case "templates":
      return <MaterialIcons name="assignment" size={20} color={color} />;
    default:
      return <MaterialIcons name="home" size={20} color={color} />;
  }
}

function PopoverExample() {
  const [muted, accentForeground] = useThemeColor([
    "muted",
    "accent-foreground",
  ]);

  return (
    <Popover>
      <Popover.Trigger asChild>
        <PressableFeedback className="bg-accent-foreground rounded-full mb-2 mr-1 size-16 flex items-center justify-center border border-accent/20">
          <MaterialIcons name="settings" size={28} color={muted} />
        </PressableFeedback>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Overlay className="bg-background/50" />
        <Popover.Content
          presentation="popover"
          width={200}
          className="gap-1 bg-accent-foreground px-6 py-4"
          placement="top"
        >
          <Button size="sm" variant="outline">
            <MaterialIcons name="verified-user" color={muted} />
            <Button.Label>Seccion Activa</Button.Label>
          </Button>
          <Button size="sm" variant="outline">
            <MaterialIcons name="verified-user" color={muted} />
            <Button.Label>Mi Perfil</Button.Label>
          </Button>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}

export function BottomTabs({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [accent, muted] = useThemeColor(["accent", "muted"]);

  return (
    <View className="absolute bottom-0 w-full flex flex-row items-center gap-x-1">
      <View className="flex-row justify-around rounded-full items-center ml-2 mb-2 bg-accent-foreground flex-1 h-16">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const handleNavigation = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <PressableFeedback
              key={route.key}
              className={cn(
                "flex-1 flex items-center rounded-full my-1 mx-1 py-2",
                isFocused ? "bg-accent/10" : "",
              )}
              onPress={handleNavigation}
            >
              {getIconByRouteName(route.name, isFocused ? accent : muted)}
              <UIText
                className={cn(
                  "text-sm",
                  isFocused ? "text-accent" : "text-muted",
                )}
              >
                {label as string}
              </UIText>
            </PressableFeedback>
          );
        })}
      </View>
      {/*<PressableFeedback className="bg-accent-foreground rounded-full mb-2 mr-1 size-16 flex items-center justify-center border border-accent/20">
        <MaterialIcons name="settings" color={muted} size={28} />
      </PressableFeedback>*/}
      <PopoverExample />
    </View>
  );
}
