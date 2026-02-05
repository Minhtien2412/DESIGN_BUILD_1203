/**
 * Chat Screen Redirect
 * Redirects to unified chat screen at /messages/[userId]
 * This file exists for backward compatibility
 * @updated 2026-01-24
 */

import { Redirect, useLocalSearchParams } from "expo-router";

export default function ChatScreenRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Extract userId from different ID formats
  // Supports: "user_123", "conv_123", "123", "support_123"
  let userId = id || "0";

  if (userId.startsWith("user_")) {
    userId = userId.replace("user_", "");
  } else if (userId.startsWith("conv_")) {
    // For conversation IDs, we need to look up the user
    // For now, just use the number part
    userId = userId.replace("conv_", "");
  } else if (userId.startsWith("support_")) {
    // Support chat - keep the format
    userId = userId.replace("support_", "");
  }

  // Redirect to unified chat screen
  return <Redirect href={`/messages/${userId}`} />;
}
