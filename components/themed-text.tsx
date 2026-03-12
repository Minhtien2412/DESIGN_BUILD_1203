import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

// Variant types for backward compatibility
type TextVariant = 'body' | 'h1' | 'h2' | 'h3' | 'h4' | 'caption';
type TextType = 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TextType;
  variant?: TextVariant; // Backward compatibility
};

// Map variant to type for backward compatibility
const variantToType: Record<TextVariant, TextType> = {
  body: 'default',
  h1: 'title',
  h2: 'subtitle',
  h3: 'defaultSemiBold',
  h4: 'default',
  caption: 'default',
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type,
  variant,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  // Use variant if provided, otherwise use type
  const resolvedType = variant ? variantToType[variant] : (type || 'default');

  return (
    <Text
      style={[
        { color },
        resolvedType === 'default' ? styles.default : undefined,
        resolvedType === 'title' ? styles.title : undefined,
        resolvedType === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        resolvedType === 'subtitle' ? styles.subtitle : undefined,
        resolvedType === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  defaultSemiBold: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  link: {
    lineHeight: 20,
    fontSize: 13,
    fontWeight: '500',
    color: '#0D9488',
  },
});
