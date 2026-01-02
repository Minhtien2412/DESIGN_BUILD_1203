import { Spacing } from '@/constants/layout';
import { ScrollView, ScrollViewProps, View, ViewProps } from 'react-native';

type ContainerProps = Omit<ScrollViewProps, 'contentContainerStyle'> & {
  fullWidth?: boolean;
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
};

export function Container({ style, fullWidth, scroll = true, contentContainerStyle, ...props }: ContainerProps) {
  // Use compact default paddings; still allow fullWidth to remove horizontal padding
  const paddingStyle = { paddingVertical: Spacing.xs, paddingHorizontal: fullWidth ? 0 : Spacing.sm } as const;
  if (scroll) {
    return (
      <ScrollView
        {...(props as ScrollViewProps)}
        style={style}
        contentContainerStyle={[paddingStyle, contentContainerStyle]}
      />
    );
  }
  return (
    <View
      {...(props as ViewProps)}
      style={[paddingStyle, style]}
    />
  );
}
