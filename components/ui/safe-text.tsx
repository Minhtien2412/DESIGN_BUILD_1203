import React from 'react';
import { Text, TextProps } from 'react-native';

interface SafeTextProps extends TextProps {
  children?: React.ReactNode;
}

/**
 * SafeText component that ensures any content is rendered within a Text component
 * Prevents "Text strings must be rendered within a <Text> component" errors
 */
export function SafeText({ children, ...props }: SafeTextProps) {
  if (children === null || children === undefined) {
    return null;
  }

  // If children is already a Text component, return as is
  if (React.isValidElement(children) && children.type === Text) {
    return children;
  }

  // Otherwise, wrap in Text component
  return (
    <Text {...props}>
      {String(children)}
    </Text>
  );
}

export default SafeText;
