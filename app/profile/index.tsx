/**
 * Profile Index - Redirects to profile tab
 * Route: /profile
 */

import { Redirect } from "expo-router";

export default function ProfileIndex() {
  return <Redirect href="/(tabs)/profile" />;
}
