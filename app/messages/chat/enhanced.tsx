/**
 * Enhanced Chat Screen Redirect
 * Redirects to unified chat screen at /messages/[userId]
 * This file exists for backward compatibility
 * @updated 2026-01-26
 */

import { Redirect, useLocalSearchParams } from "expo-router";

export default function EnhancedChatRedirect() {
  const { recipientId, conversationId } = useLocalSearchParams<{
    recipientId?: string;
    conversationId?: string;
  }>();

  // Use recipientId or conversationId
  const userId = recipientId || conversationId || "0";

  // Redirect to unified chat screen
  return <Redirect href={`/messages/${userId}`} />;
}
