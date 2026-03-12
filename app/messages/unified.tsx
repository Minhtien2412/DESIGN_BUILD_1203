/**
 * Unified Messages Screen Redirect
 * Redirects to main messages index
 * This file exists for backward compatibility
 * @updated 2026-01-26
 */

import { Redirect } from "expo-router";

export default function UnifiedMessagesRedirect() {
  return <Redirect href="/messages" />;
}
