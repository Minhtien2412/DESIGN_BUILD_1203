/**
 * useReadReceipts Hook
 * ====================
 *
 * Hook quản lý read receipts cho messaging
 *
 * Features:
 * - Mark messages as read
 * - Track read status
 * - Unread counts
 * - WebSocket sync
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { apiFetch } from "@/services/api";
import { conversationsSocket } from "@/services/conversations-socket.service";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface ReadReceipt {
  userId: number;
  userName?: string;
  avatar?: string | null;
  readAt: Date | string;
  lastReadSeq?: number;
}

export interface UnreadCount {
  conversationId: string;
  unreadCount: number;
}

export interface UseReadReceiptsReturn {
  /** Mark messages as read */
  markAsRead: (conversationId: string, messageId?: string) => Promise<void>;
  /** Get read receipts for a message */
  getReadReceipts: (
    conversationId: string,
    messageId: string,
  ) => Promise<ReadReceipt[]>;
  /** Unread counts per conversation */
  unreadCounts: Map<string, number>;
  /** Total unread count */
  totalUnread: number;
  /** Refresh unread counts */
  refreshUnreadCounts: () => Promise<void>;
  /** Check if message is read by user */
  isReadByUser: (
    messageSeq: number,
    userId: number,
    conversationParticipants: any[],
  ) => boolean;
  /** Loading state */
  isLoading: boolean;
}

// ============================================================================
// Hook
// ============================================================================

export function useReadReceipts(): UseReadReceiptsReturn {
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);

  // ============================================
  // Load initial unread counts
  // ============================================

  useEffect(() => {
    refreshUnreadCounts();
  }, []);

  // ============================================
  // WebSocket listener for read receipts
  // ============================================

  useEffect(() => {
    const handleReadReceipt = (data: {
      conversationId: string;
      userId: number;
      lastReadSeq: number;
    }) => {
      // If it's a receipt from another user, we might want to update UI
      // For now, we'll just log it
      console.log("[useReadReceipts] Received read receipt:", data);
    };

    conversationsSocket.on("read.receipt", handleReadReceipt);

    return () => {
      conversationsSocket.off("read.receipt", handleReadReceipt);
    };
  }, []);

  // ============================================
  // API Methods
  // ============================================

  const refreshUnreadCounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch<UnreadCount[]>("/messages/unread-counts");

      // apiFetch returns data directly, not wrapped in .data
      if (Array.isArray(response)) {
        const newCounts = new Map<string, number>();
        response.forEach((item) => {
          newCounts.set(item.conversationId, item.unreadCount);
        });
        setUnreadCounts(newCounts);
      }
    } catch (error) {
      console.error("[useReadReceipts] Failed to fetch unread counts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (conversationId: string, messageId?: string) => {
      try {
        await apiFetch(`/conversations/${conversationId}/messages/read`, {
          method: "POST",
          body: JSON.stringify({ messageId }),
        });

        // Update local count
        setUnreadCounts((prev) => {
          const newCounts = new Map(prev);
          newCounts.set(conversationId, 0);
          return newCounts;
        });

        // Also send via WebSocket for realtime sync
        conversationsSocket.markAsRead(conversationId, messageId);
      } catch (error) {
        console.error("[useReadReceipts] Failed to mark as read:", error);
        throw error;
      }
    },
    [],
  );

  const getReadReceipts = useCallback(
    async (
      conversationId: string,
      messageId: string,
    ): Promise<ReadReceipt[]> => {
      try {
        const response = await apiFetch<{
          receipts: ReadReceipt[];
        }>(
          `/conversations/${conversationId}/messages/${messageId}/read-receipts`,
        );

        return response.receipts || [];
      } catch (error) {
        console.error("[useReadReceipts] Failed to get read receipts:", error);
        return [];
      }
    },
    [],
  );

  // ============================================
  // Helper Methods
  // ============================================

  const isReadByUser = useCallback(
    (
      messageSeq: number,
      userId: number,
      conversationParticipants: any[],
    ): boolean => {
      const participant = conversationParticipants.find(
        (p) => p.userId === userId,
      );
      if (!participant) return false;
      return (participant.lastReadSeq || 0) >= messageSeq;
    },
    [],
  );

  // ============================================
  // Computed values
  // ============================================

  const totalUnread = Array.from(unreadCounts.values()).reduce(
    (sum, count) => sum + count,
    0,
  );

  return {
    markAsRead,
    getReadReceipts,
    unreadCounts,
    totalUnread,
    refreshUnreadCounts,
    isReadByUser,
    isLoading,
  };
}

export default useReadReceipts;
