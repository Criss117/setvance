import { ScrollView } from "react-native";
import { Card } from "heroui-native/card";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const items = Array.from({ length: 20 }).map((_, index) => ({
  name: "Persona " + index,
}));

export default function Sessions() {
  const bh = useBottomTabBarHeight();

  return (
    <ScrollView contentContainerClassName="gap-y-5 pb-24">
      {items.map((item) => (
        <Card key={item.name}>
          <Card.Header>
            <Card.Title>{item.name}</Card.Title>
            <Card.Description>{bh}</Card.Description>
          </Card.Header>
        </Card>
      ))}
    </ScrollView>
  );
}
