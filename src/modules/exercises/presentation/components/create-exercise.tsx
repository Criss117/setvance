import { Button } from "heroui-native/button";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { MaterialIcons } from "@shared/lib/with-uniwind";
import { UIText } from "@/modules/shared/components/ui-text";

export function CreateExercise() {
  return (
    <BottomSheet>
      <BottomSheet.Trigger asChild>
        <Button size="sm" isIconOnly>
          <MaterialIcons name="add" size={24} />
        </Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-accent-foreground/40" />
        <BottomSheet.Content>
          <UIText>Nuevo ejercicio</UIText>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
