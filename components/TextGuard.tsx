import React from 'react';
import { Text } from 'react-native';

export default function TextGuard({ children }: { children: React.ReactNode }) {
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text>{String(children)}</Text>;
  }
  return <>{children}</>;
}
