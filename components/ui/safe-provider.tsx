import React from 'react';
import { Text, View } from 'react-native';

/**
 * SafeProvider wraps any provider to ensure children are always safely rendered
 */
export function SafeProvider({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  try {
    // Ensure children is always valid React node
    if (children === null || children === undefined) {
      return fallback || <View><Text>Loading...</Text></View>;
    }

    // Check if children contains any raw strings
    const processChildren = (node: React.ReactNode): React.ReactNode => {
      if (typeof node === 'string') {
        return <Text>{node}</Text>;
      }
      if (typeof node === 'number') {
        return <Text>{String(node)}</Text>;
      }
      if (React.isValidElement(node)) {
        return node;
      }
      if (Array.isArray(node)) {
        return node.map((child, index) => (
          <React.Fragment key={index}>
            {processChildren(child)}
          </React.Fragment>
        ));
      }
      return node;
    };

    return <>{processChildren(children)}</>;
  } catch (error) {
    console.warn('[SafeProvider] Error processing children:', error);
    return fallback || <View><Text>Error loading content</Text></View>;
  }
}

export default SafeProvider;
