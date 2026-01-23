/**
 * Search Messages Screen
 * =======================
 *
 * Screen tìm kiếm tin nhắn toàn cục
 *
 * Features:
 * - Search across all conversations
 * - Jump to message in conversation
 * - Filter by type, date
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { SearchMessages, SearchResult } from "@/components/chat/SearchMessages";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function SearchMessagesScreen() {
  const params = useLocalSearchParams<{ conversationId?: string }>();

  const handleSelectResult = useCallback((result: SearchResult) => {
    // Navigate to conversation and scroll to message
    router.push({
      pathname: "/conversation/[id]",
      params: {
        id: result.message.conversationId,
        scrollToMessageId: result.message.id,
        highlightSeq: String(result.message.seq),
      },
    });
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  return (
    <SearchMessages
      conversationId={params.conversationId}
      onSelectResult={handleSelectResult}
      onClose={handleClose}
      placeholder={
        params.conversationId
          ? "Tìm trong cuộc trò chuyện..."
          : "Tìm kiếm tất cả tin nhắn..."
      }
    />
  );
}
