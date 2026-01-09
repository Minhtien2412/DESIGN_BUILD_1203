/**
 * CRM Routes Layout
 * Handles navigation within the CRM module
 * 
 * Routes (24 screens - Full Perfex CRM Features):
 * - index: Dashboard overview
 * - admin: Admin panel
 * - projects: Projects list
 * - project-detail: Project detail with tabs (Perfex CRM style)
 * - project-management: Enhanced project management
 * - customers: Customer management
 * - tasks: Tasks Kanban board
 * - time-tracking: Time logging
 * - milestones: Project milestones
 * - expenses: Expense tracking
 * - gantt-chart: Gantt chart view
 * - files: Project files
 * - discussions: Project discussions/chat
 * - notes: Project notes
 * - activity: Activity log
 * - contracts: Contract management
 * - sales: Sales/Revenue tracking
 * - tickets: Support tickets/requests
 * - mind-map: Mind map visualization
 * - reports: Reports & analytics
 * - leads: Lead pipeline
 * - invoices: Invoice & payment tracking
 * - staff: Staff management
 * - settings: CRM settings
 * 
 * @updated 2025-01-17
 */

import { Stack } from 'expo-router';

export default function CrmLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="projects" options={{ headerShown: false }} />
      <Stack.Screen name="project-detail" options={{ headerShown: false }} />
      <Stack.Screen name="project-management" options={{ headerShown: false }} />
      <Stack.Screen name="customers" options={{ headerShown: false }} />
      <Stack.Screen name="tasks" options={{ headerShown: false }} />
      <Stack.Screen name="time-tracking" options={{ headerShown: false }} />
      <Stack.Screen name="milestones" options={{ headerShown: false }} />
      <Stack.Screen name="expenses" options={{ headerShown: false }} />
      <Stack.Screen name="gantt-chart" options={{ headerShown: false }} />
      <Stack.Screen name="files" options={{ headerShown: false }} />
      <Stack.Screen name="discussions" options={{ headerShown: false }} />
      <Stack.Screen name="notes" options={{ headerShown: false }} />
      <Stack.Screen name="activity" options={{ headerShown: false }} />
      <Stack.Screen name="contracts" options={{ headerShown: false }} />
      <Stack.Screen name="sales" options={{ headerShown: false }} />
      <Stack.Screen name="tickets" options={{ headerShown: false }} />
      <Stack.Screen name="mind-map" options={{ headerShown: false }} />
      <Stack.Screen name="reports" options={{ headerShown: false }} />
      <Stack.Screen name="leads" options={{ headerShown: false }} />
      <Stack.Screen name="invoices" options={{ headerShown: false }} />
      <Stack.Screen name="staff" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
