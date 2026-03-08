import { DBProvider } from "./db";
import { FontsProvider } from "./fonts";
import { HeroUIProvider } from "./hero-ui";

interface Props {
  children: React.ReactNode;
}

export function Integrations({ children }: Props) {
  return (
    <DBProvider>
      <FontsProvider>
        <HeroUIProvider>{children}</HeroUIProvider>
      </FontsProvider>
    </DBProvider>
  );
}
