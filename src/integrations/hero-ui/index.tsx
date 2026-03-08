import { HeroUINativeProvider } from "heroui-native/provider";

interface Props {
  children: React.ReactNode;
}

export function HeroUIProvider({ children }: Props) {
  return <HeroUINativeProvider>{children}</HeroUINativeProvider>;
}
