/**
 * AI Analysis Layout
 * Stack navigation for AI analysis features
 *
 * @author AI Assistant
 * @date 19/01/2026
 */

import { Stack } from "expo-router";

export default function AIAnalysisLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "AI Analysis",
        }}
      />
      <Stack.Screen
        name="photo"
        options={{
          title: "Photo Analysis",
        }}
      />
      <Stack.Screen
        name="progress"
        options={{
          title: "Progress Analysis",
        }}
      />
      <Stack.Screen
        name="material"
        options={{
          title: "Material Analysis",
        }}
      />
      <Stack.Screen
        name="cost"
        options={{
          title: "Cost Analysis",
        }}
      />
      <Stack.Screen
        name="safety"
        options={{
          title: "Safety Analysis",
        }}
      />
    </Stack>
  );
}
