import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/layout';
import React from 'react';
import { View, ViewProps } from 'react-native';

export function Section({ title, children, style }: { title?: string; children?: React.ReactNode; style?: ViewProps['style'] }) {
  return (
    <View style={style}>
      {title ? (
        <ThemedText type="title" style={{ marginTop: Spacing.xs + 2, marginBottom: Spacing.xs + 2, fontSize: 14 }}>
          {title}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}
