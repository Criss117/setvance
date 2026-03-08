import { useThemeColor } from "heroui-native/hooks";
import { ActivityIndicator, Text, View } from "react-native";

interface Props {
  message?: string | string[];
}

export function LoadingApp({ message }: Props) {
  const accent = useThemeColor("accent");

  const allMessages = typeof message === "string" ? [message] : message;

  return (
    <View className="flex-1 items-center justify-center bg-background gap-y-4">
      <Text className="text-accent text-5xl font-semibold">Setvance</Text>
      <ActivityIndicator color={accent} size={32} />
      {allMessages?.map((m) => (
        <Text key={m} className="text-muted text-sm">
          {m}
        </Text>
      ))}
    </View>
  );
}
