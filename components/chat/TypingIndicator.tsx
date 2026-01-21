/**
 * TypingIndicator Component
 * Shows animated dots when other users are typing
 *
 * @created 19/01/2026
 * @updated Support both Map and string[] input formats
 */

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export interface TypingIndicatorProps {
  // Support either a Map (legacy) or string array (new usage)
  typingUsers?: Map<
    number,
    { name: string; timeout: ReturnType<typeof setTimeout> }
  >;
  // Alternative: array of user names
  users?: string[];
  // Visibility control
  visible?: boolean;
  style?: object;
}

export function TypingIndicator({
  typingUsers,
  users,
  visible = true,
  style,
}: TypingIndicatorProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Get user count from either format
    const userCount = typingUsers?.size || users?.length || 0;
    if (userCount === 0 || !visible) return;

    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    };

    const animation = Animated.parallel([
      animateDot(dot1, 0),
      animateDot(dot2, 150),
      animateDot(dot3, 300),
    ]);

    animation.start();

    return () => {
      animation.stop();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, [typingUsers?.size, users?.length, visible]);

  // Get user count from either format
  const userCount = typingUsers?.size || users?.length || 0;
  if (userCount === 0 || !visible) return null;

  // Get names from either Map or array
  const names = typingUsers
    ? Array.from(typingUsers.values()).map((u) => u.name)
    : users || [];
  let text = "";

  if (names.length === 1) {
    text = `${names[0]} đang nhập`;
  } else if (names.length === 2) {
    text = `${names[0]} và ${names[1]} đang nhập`;
  } else {
    text = `${names.length} người đang nhập`;
  }

  const translateY = (dot: Animated.Value) => ({
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{text}</Text>
      <View style={styles.dots}>
        <Animated.View style={[styles.dot, translateY(dot1)]} />
        <Animated.View style={[styles.dot, translateY(dot2)]} />
        <Animated.View style={[styles.dot, translateY(dot3)]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666",
  },
});

export default TypingIndicator;
