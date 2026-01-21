/**
 * QC/QA Layout
 * Stack navigation for Quality Control & Quality Assurance
 *
 * @author AI Assistant
 * @date 19/01/2026
 */

import { Stack } from "expo-router";

export default function QCQALayout() {
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
          title: "QC/QA",
        }}
      />
      <Stack.Screen
        name="inspections"
        options={{
          title: "Inspections",
        }}
      />
      <Stack.Screen
        name="checklists"
        options={{
          title: "Checklists",
        }}
      />
      <Stack.Screen
        name="defects"
        options={{
          title: "Defects",
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: "QC Reports",
        }}
      />
      <Stack.Screen
        name="standards"
        options={{
          title: "Standards",
        }}
      />
    </Stack>
  );
}
