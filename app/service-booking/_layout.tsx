/**
 * Service Booking Layout
 * Handles routing for the service booking flow
 */
import { Stack } from "expo-router";

export default function ServiceBookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
