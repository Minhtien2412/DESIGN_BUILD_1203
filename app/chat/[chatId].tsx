/**
 * Chat Screen Redirect
 * Redirects to unified chat screen at /messages/[userId]
 * This file exists for backward compatibility
 * @updated 2026-01-24
 */

import { Redirect, useLocalSearchParams } from "expo-router";

export default function ChatScreenRedirect() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  // Redirect to unified messages chat
  return <Redirect href={`/messages/${chatId || "0"}`} />;
}
