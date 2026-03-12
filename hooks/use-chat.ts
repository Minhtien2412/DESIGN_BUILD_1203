/**
 * useChat Hook - Real-time chat state management
 * Integrates with ChatService for Socket.IO communication
 * AND ChatAPIService for REST API data
 */

import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/services/apiClient";
import { chatAPIService } from "@/services/chatAPIService";
import ChatService, {
    Attachment,
    ChatMessage,
    ChatRoom,
    ChatStorage,
    MessageType,
    TypingStatus,
} from "@/services/ChatService";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseChatOptions {
  chatId?: string;
  autoConnect?: boolean;
}

interface UseChatReturn {
  // State
  isConnected: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  chatRooms: ChatRoom[];
  typingUsers: Map<string, TypingStatus>;
  currentChatId: string | null;
  error: string | null;

  // Actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  sendMessage: (
    content: string,
    options?: {
      type?: MessageType;
      attachments?: Attachment[];
      replyTo?: ChatMessage;
    }
  ) => Promise<boolean>;
  deleteMessage: (messageId: string, forEveryone?: boolean) => Promise<boolean>;
  editMessage: (messageId: string, newContent: string) => Promise<boolean>;
  addReaction: (messageId: string, emoji: string) => Promise<boolean>;
  removeReaction: (messageId: string, emoji: string) => Promise<boolean>;
  markAsRead: (messageIds: string[]) => void;
  setTyping: (isTyping: boolean) => void;
  switchChat: (chatId: string) => void;
  loadMoreMessages: () => Promise<void>;
  refreshChatRooms: () => Promise<void>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { chatId, autoConnect = true } = options;
  const { user } = useAuth();

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(
    new Map()
  );
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    chatId || null
  );
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Connect to chat service
  const connect = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      // Don't set error - we can still load mock data
      console.log("[useChat] No user, skipping socket connection");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      // Get token from storage
      const token = (await getAccessToken()) || "";
      const connected = await ChatService.connect(user.id.toString(), token);
      setIsConnected(connected);

      if (!connected) {
        // Don't show error - mock data will work
        console.log("[useChat] Socket not connected, using REST API");
      }

      return connected;
    } catch (err) {
      console.log("[useChat] Connection error, fallback to REST API");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Disconnect
  const disconnect = useCallback(() => {
    ChatService.disconnect();
    setIsConnected(false);
  }, []);

  // Load stored data and API data
  const loadStoredData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load from API first
      const apiRooms = await chatAPIService.getChatRooms();
      if (apiRooms.length > 0) {
        setChatRooms(apiRooms);
        // Save to storage for offline
        await ChatStorage.saveChatRooms(apiRooms);
      } else {
        // Fallback to stored data
        const storedRooms = await ChatStorage.getChatRooms();
        setChatRooms(storedRooms);
      }

      if (currentChatId) {
        // Load messages from API
        const { messages: apiMessages } = await chatAPIService.getMessages(
          currentChatId,
          { limit: 50 }
        );
        if (apiMessages.length > 0) {
          setMessages(apiMessages);
          // Save to storage for offline
          await ChatStorage.saveMessages(currentChatId, apiMessages);
        } else {
          // Fallback to stored data
          const storedMessages = await ChatStorage.getMessages(currentChatId);
          setMessages(storedMessages);
        }
      }
    } catch (err) {
      console.error("[useChat] Failed to load data:", err);
      // Fallback to stored data
      const storedRooms = await ChatStorage.getChatRooms();
      setChatRooms(storedRooms);
      if (currentChatId) {
        const storedMessages = await ChatStorage.getMessages(currentChatId);
        setMessages(storedMessages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId]);

  // Setup event handlers
  useEffect(() => {
    // Message received
    ChatService.on("onMessage", (message) => {
      if (message.chatId === currentChatId) {
        setMessages((prev) => {
          // Check for duplicate (optimistic update)
          const exists = prev.some((m) => m.id === message.id);
          if (exists) {
            return prev.map((m) => (m.id === message.id ? message : m));
          }
          return [...prev, message];
        });
      }

      // Update chat rooms with last message
      setChatRooms((prev) =>
        prev.map((room) => {
          if (room.id === message.chatId) {
            return {
              ...room,
              lastMessage: message,
              unreadCount:
                room.id === currentChatId
                  ? room.unreadCount
                  : room.unreadCount + 1,
              updatedAt: message.timestamp,
            };
          }
          return room;
        })
      );
    });

    // Message updated
    ChatService.on("onMessageUpdated", (message) => {
      if (message.chatId === currentChatId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? message : m))
        );
      }
    });

    // Message deleted
    ChatService.on("onMessageDeleted", (messageId, chatId) => {
      if (chatId === currentChatId) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    });

    // Typing status
    ChatService.on("onTyping", (status) => {
      if (
        status.chatId === currentChatId &&
        status.userId !== user?.id?.toString()
      ) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          if (status.isTyping) {
            newMap.set(status.userId, status);
          } else {
            newMap.delete(status.userId);
          }
          return newMap;
        });
      }
    });

    // Read receipts
    ChatService.on("onRead", (chatId, userId, messageIds) => {
      if (chatId === currentChatId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (messageIds.includes(m.id)) {
              return {
                ...m,
                readBy: [...(m.readBy || []), userId],
                status: "read" as const,
              };
            }
            return m;
          })
        );
      }
    });

    // Delivered receipts
    ChatService.on("onDelivered", (chatId, userId, messageIds) => {
      if (chatId === currentChatId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (messageIds.includes(m.id) && m.status !== "read") {
              return {
                ...m,
                deliveredTo: [...(m.deliveredTo || []), userId],
                status: "delivered" as const,
              };
            }
            return m;
          })
        );
      }
    });

    // Reactions
    ChatService.on("onReaction", (messageId, reaction) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const reactions = m.reactions || [];
            // Remove existing reaction from same user with same emoji
            const filtered = reactions.filter(
              (r) =>
                !(r.userId === reaction.userId && r.emoji === reaction.emoji)
            );
            return { ...m, reactions: [...filtered, reaction] };
          }
          return m;
        })
      );
    });

    // Connection status
    ChatService.on("onConnectionChange", (connected) => {
      setIsConnected(connected);
    });

    // Error handling
    ChatService.on("onError", (err) => {
      setError(err.message);
    });

    return () => {
      ChatService.off("onMessage");
      ChatService.off("onMessageUpdated");
      ChatService.off("onMessageDeleted");
      ChatService.off("onTyping");
      ChatService.off("onRead");
      ChatService.off("onDelivered");
      ChatService.off("onReaction");
      ChatService.off("onConnectionChange");
      ChatService.off("onError");
    };
  }, [currentChatId, user?.id]);

  // Auto connect on mount - always load data regardless of socket connection
  useEffect(() => {
    // Load data from API/storage first - this works without socket
    loadStoredData();

    // Then try to establish socket connection (optional, for real-time)
    if (autoConnect) {
      connect();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [autoConnect, connect, loadStoredData]);

  // Load messages when chat changes - works with or without socket
  useEffect(() => {
    if (!currentChatId) return;

    // Join room if connected (for real-time)
    if (isConnected) {
      ChatService.joinRoom(currentChatId);
    }

    // Load messages from API first, then storage fallback
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { messages: apiMessages } = await chatAPIService.getMessages(
          currentChatId,
          { limit: 50 }
        );
        if (apiMessages.length > 0) {
          setMessages(apiMessages);
          await ChatStorage.saveMessages(currentChatId, apiMessages);
        } else {
          const storedMessages = await ChatStorage.getMessages(currentChatId);
          setMessages(storedMessages);
        }
      } catch (err) {
        console.error("[useChat] Failed to load messages from API:", err);
        const storedMessages = await ChatStorage.getMessages(currentChatId);
        setMessages(storedMessages);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      if (isConnected) {
        ChatService.leaveRoom(currentChatId);
      }
    };
  }, [currentChatId, isConnected]);

  // Persist messages
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      ChatStorage.saveMessages(currentChatId, messages);
    }
  }, [currentChatId, messages]);

  // Persist chat rooms
  useEffect(() => {
    if (chatRooms.length > 0) {
      ChatStorage.saveChatRooms(chatRooms);
    }
  }, [chatRooms]);

  // Send message via API + Socket with optimistic update
  const sendMessage = useCallback(
    async (
      content: string,
      options?: {
        type?: MessageType;
        attachments?: Attachment[];
        replyTo?: ChatMessage;
      }
    ): Promise<boolean> => {
      if (!currentChatId) return false;

      // Create optimistic message immediately
      const optimisticId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        chatId: currentChatId,
        senderId: "current_user", // Will be replaced by actual user ID
        senderName: "Bạn",
        type: options?.type || "text",
        content,
        status: "sending",
        timestamp: Date.now(),
        attachments: options?.attachments,
        replyTo: options?.replyTo
          ? {
              id: options.replyTo.id,
              senderId: options.replyTo.senderId || "",
              senderName: options.replyTo.senderName || "",
              content: options.replyTo.content,
              type: options.replyTo.type || "text",
            }
          : undefined,
      };

      // Add optimistic message to UI immediately
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        // Send via API first
        const apiMessage = await chatAPIService.sendMessage({
          chatId: currentChatId,
          content,
          type: options?.type,
          attachments: options?.attachments,
          replyToId: options?.replyTo?.id,
        });

        if (apiMessage) {
          // Replace optimistic message with real one
          setMessages((prev) =>
            prev.map((m) =>
              m.id === optimisticId
                ? { ...apiMessage, status: "sent" as const }
                : m
            )
          );
          // Also notify via Socket for real-time sync
          ChatService.sendMessage(currentChatId, content, options);
          return true;
        }

        // Fallback to socket only
        const result = await ChatService.sendMessage(
          currentChatId,
          content,
          options
        );
        if (result !== null) {
          // Update status to sent
          setMessages((prev) =>
            prev.map((m) =>
              m.id === optimisticId ? { ...m, status: "sent" as const } : m
            )
          );
          return true;
        }

        // Both API and Socket failed - keep message locally with 'failed' status
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, status: "failed" as const } : m
          )
        );
        console.warn("[useChat] Message sent locally only (offline mode)");
        return true; // Return true to clear input - message is saved locally
      } catch (error) {
        console.error("[useChat] Send message error:", error);
        // Mark as failed but keep in UI
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, status: "failed" as const } : m
          )
        );
        return true; // Return true to clear input - message is saved locally
      }
    },
    [currentChatId]
  );

  // Delete message via API
  const deleteMessage = useCallback(
    async (messageId: string, forEveryone = false): Promise<boolean> => {
      if (!currentChatId) return false;

      // Delete via API
      const success = await chatAPIService.deleteMessage(messageId);
      if (success) {
        // Remove from local state
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }

      // Also notify via Socket
      return ChatService.deleteMessage(messageId, currentChatId, forEveryone);
    },
    [currentChatId]
  );

  // Edit message via API
  const editMessage = useCallback(
    async (messageId: string, newContent: string): Promise<boolean> => {
      if (!currentChatId) return false;

      // Edit via API
      const updatedMessage = await chatAPIService.editMessage(
        messageId,
        newContent
      );
      if (updatedMessage) {
        // Update local state
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? updatedMessage : m))
        );
      }

      // Also notify via Socket
      return ChatService.editMessage(messageId, currentChatId, newContent);
    },
    [currentChatId]
  );

  // Add reaction via API
  const addReaction = useCallback(
    async (messageId: string, emoji: string): Promise<boolean> => {
      if (!currentChatId) return false;

      // Add via API
      await chatAPIService.addReaction(messageId, emoji);

      // Also notify via Socket
      return ChatService.addReaction(messageId, currentChatId, emoji);
    },
    [currentChatId]
  );

  // Remove reaction via API
  const removeReaction = useCallback(
    async (messageId: string, emoji: string): Promise<boolean> => {
      if (!currentChatId) return false;

      // Remove via API
      await chatAPIService.removeReaction(messageId, emoji);

      // Also notify via Socket
      return ChatService.removeReaction(messageId, currentChatId, emoji);
    },
    [currentChatId]
  );

  // Mark as read via API
  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (!currentChatId) return;

      // Mark via API
      chatAPIService.markAsRead(currentChatId);

      // Notify via Socket
      ChatService.markAsRead(currentChatId, messageIds);

      // Update local state
      setMessages((prev) =>
        prev.map((m) => {
          if (messageIds.includes(m.id)) {
            return { ...m, status: "read" as const };
          }
          return m;
        })
      );

      // Update unread count
      setChatRooms((prev) =>
        prev.map((room) => {
          if (room.id === currentChatId) {
            return { ...room, unreadCount: 0 };
          }
          return room;
        })
      );
    },
    [currentChatId]
  );

  // Set typing status
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!currentChatId) return;

      // Debounce typing status
      if (isTyping !== isTypingRef.current) {
        isTypingRef.current = isTyping;
        ChatService.sendTyping(currentChatId, isTyping);
      }

      // Auto stop typing after 3 seconds
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          ChatService.sendTyping(currentChatId, false);
        }, 3000);
      }
    },
    [currentChatId]
  );

  // Switch chat
  const switchChat = useCallback(
    (newChatId: string) => {
      if (currentChatId) {
        ChatService.leaveRoom(currentChatId);
      }
      setCurrentChatId(newChatId);
      setMessages([]);
      setTypingUsers(new Map());
    },
    [currentChatId]
  );

  // Load more messages (pagination) via API
  const loadMoreMessages = useCallback(async () => {
    if (!currentChatId || isLoading) return;

    setIsLoading(true);
    try {
      const oldestMessage = messages[0];
      const { messages: moreMessages, hasMore } =
        await chatAPIService.getMessages(currentChatId, {
          limit: 30,
          before: oldestMessage?.id,
        });

      if (moreMessages.length > 0) {
        setMessages((prev) => [...moreMessages, ...prev]);
        // Save to storage
        await ChatStorage.saveMessages(currentChatId, [
          ...moreMessages,
          ...messages,
        ]);
      }

      console.log(
        "[useChat] Loaded",
        moreMessages.length,
        "more messages, hasMore:",
        hasMore
      );
    } catch (err) {
      console.error("[useChat] Failed to load more messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, messages, isLoading]);

  // Refresh chat rooms via API
  const refreshChatRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiRooms = await chatAPIService.getChatRooms();
      if (apiRooms.length > 0) {
        setChatRooms(apiRooms);
        await ChatStorage.saveChatRooms(apiRooms);
      }
      console.log("[useChat] Refreshed", apiRooms.length, "chat rooms");
    } catch (err) {
      console.error("[useChat] Failed to refresh chat rooms:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isConnected,
    isLoading,
    messages,
    chatRooms,
    typingUsers,
    currentChatId,
    error,
    connect,
    disconnect,
    sendMessage,
    deleteMessage,
    editMessage,
    addReaction,
    removeReaction,
    markAsRead,
    setTyping,
    switchChat,
    loadMoreMessages,
    refreshChatRooms,
  };
}

export default useChat;
