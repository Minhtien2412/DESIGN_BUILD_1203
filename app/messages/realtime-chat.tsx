/**
 * Realtime Chat Screen Redirect
 * Redirects to unified messages screen
 * This file exists for backward compatibility
 * @updated 2026-01-24
 */

import { Redirect } from "expo-router";

export default function RealtimeChatRedirect() {
  // Redirect to main messages screen
  return <Redirect href="/messages" />;
}
