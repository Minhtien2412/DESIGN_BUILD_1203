import {
    StyleProp,
    StyleSheet,
    Text,
    TextProps,
    TextStyle,
} from "react-native";

import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type AppTextVariant =
  | "hero"
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "body"
  | "bodySmall"
  | "caption"
  | "micro"
  | "button"
  | "overline";

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: string;
  weight?: keyof typeof typography.weight;
  align?: TextStyle["textAlign"];
  style?: StyleProp<TextStyle>;
};

const variantStyles = StyleSheet.create<Record<AppTextVariant, TextStyle>>({
  hero: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.hero,
    lineHeight: typography.lineHeight.hero,
    fontWeight: typography.weight.heavy,
  },
  h1: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.weight.bold,
  },
  h2: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
  },
  h3: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.h3,
    lineHeight: typography.lineHeight.h3,
    fontWeight: typography.weight.semibold,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.title,
    lineHeight: typography.lineHeight.title,
    fontWeight: typography.weight.semibold,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.regular,
  },
  bodySmall: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    fontWeight: typography.weight.regular,
  },
  caption: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  micro: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.micro,
    lineHeight: typography.lineHeight.micro,
    fontWeight: typography.weight.medium,
  },
  button: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.title,
    lineHeight: typography.lineHeight.title,
    fontWeight: typography.weight.bold,
  },
  overline: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.micro,
    lineHeight: typography.lineHeight.micro,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

export default function AppText({
  variant = "body",
  color = colors.text,
  align,
  style,
  weight,
  children,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        variantStyles[variant],
        {
          color,
          textAlign: align,
          fontWeight: weight
            ? typography.weight[weight]
            : variantStyles[variant].fontWeight,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
