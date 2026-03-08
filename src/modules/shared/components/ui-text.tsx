import { ComponentProps } from "react";
import { Text } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

export const textVariants = tv({
  base: "text-white",
  variants: {
    size: {
      h1: "text-5xl font-bold",
      h2: "text-4xl font-bold",
      h3: "text-3xl font-bold",
      h4: "text-2xl font-semibold",
      h5: "text-xl font-semibold",
      h6: "text-lg font-semibold",
      p: "text-base",
      muted: "text-sm text-muted",
    },
  },
  defaultVariants: {
    size: "p",
  },
});

interface Props extends ComponentProps<typeof Text> {
  variants?: VariantProps<typeof textVariants>;
}

export function UIText({ className, variants, ...props }: Props) {
  return (
    <Text
      style={{ fontFamily: "Geist" }}
      {...props}
      className={textVariants({
        ...variants,
        class: className,
      })}
    />
  );
}
