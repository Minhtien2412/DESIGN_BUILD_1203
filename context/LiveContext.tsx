/**
 * LiveContext - Full Implementation
 * Real-time livestream functionality with WebSocket integration
 *
 * Features:
 * - Go live / stop streaming
 * - View count tracking
 * - Real-time comments
 * - Reactions (likes, hearts)
 * - Follow system
 * - Stream metadata
 */

import { useAuth } from "@/context/AuthContext";
import { liveKitService } from "@/services/livekit.service";
import socketManager from "@/services/socket";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  thumbnailUrl?: string;
  viewerCount: number;
  likeCount: number;
  status: "preparing" | "live" | "ended";
  startedAt?: string;
  endedAt?: string;
  roomName?: string;
  streamKey?: string;
}

export interface LiveComment {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: "text" | "gift" | "system";
  giftType?: string;
  timestamp: number;
}

export interface LiveReaction {
  type: "like" | "heart" | "fire" | "star";
  count: number;
}

interface LiveContextType {
  // Current stream state
  currentStream: LiveStream | null;
  isLive: boolean;
  isBroadcaster: boolean;
  viewerCount: number;
  comments: LiveComment[];
  reactions: LiveReaction[];

  // Legacy compatibility
  viewers: number;
  current: LiveStream | null;

  // Connection state
  connected: boolean;
  connecting: boolean;
  error: string | null;

  // Broadcaster actions
  startLive: (
    title?: string,
    description?: string
  ) => Promise<LiveStream | null>;
  stopLive: () => Promise<void>;
  updateStreamInfo: (title: string, description?: string) => Promise<void>;

  // Viewer actions
  joinStream: (streamId: string) => Promise<boolean>;
  leaveStream: () => void;

  // Interaction actions
  sendComment: (content: string) => void;
  addComment: (text: string) => void; // Legacy alias
  getComments: (videoId?: string) => LiveComment[];
  addCommentFor: (videoId: string, text: string) => void;
  sendReaction: (type: LiveReaction["type"]) => void;
  sendGift: (giftType: string, amount?: number) => void;

  // Follow system
  followedHosts: string[];
  isFollowing: (hostId: string) => boolean;
  toggleFollow: (hostId: string) => void;

  // Likes
  likeCount: number;
  isLiked: (videoId?: string) => boolean;
  getLikes: (videoId?: string) => number;
  toggleLike: (videoId?: string) => void;

  // UI state
  commentsVisible: boolean;
  toggleCommentsVisible: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const LiveContext = createContext<LiveContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Stream state
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [reactions, setReactions] = useState<LiveReaction[]>([
    { type: "like", count: 0 },
    { type: "heart", count: 0 },
    { type: "fire", count: 0 },
    { type: "star", count: 0 },
  ]);

  // Connection state
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User state
  const [followedHosts, setFollowedHosts] = useState<string[]>([]);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [commentsVisible, setCommentsVisible] = useState(true);

  // Refs
  const socketRef =
    useRef<
      ReturnType<typeof socketManager.connect> extends Promise<infer T>
        ? T
        : any
    >(null);
  const streamIdRef = useRef<string | null>(null);

  // ============================================================================
  // SOCKET EVENTS
  // ============================================================================

  useEffect(() => {
    // Connect to livestream socket namespace
    const setupSocket = async () => {
      try {
        const socket = await socketManager.connect();
        socketRef.current = socket;
        setConnected(true);

        // Listen for livestream events
        socket.on("live:viewer_joined", (data: { viewerCount: number }) => {
          setViewerCount(data.viewerCount);
        });

        socket.on("live:viewer_left", (data: { viewerCount: number }) => {
          setViewerCount(data.viewerCount);
        });

        socket.on("live:new_comment", (comment: LiveComment) => {
          setComments((prev) => [...prev.slice(-99), comment]); // Keep last 100 comments
        });

        socket.on(
          "live:reaction",
          (data: { type: LiveReaction["type"]; count: number }) => {
            setReactions((prev) =>
              prev.map((r) =>
                r.type === data.type ? { ...r, count: data.count } : r
              )
            );
          }
        );

        socket.on("live:stream_ended", () => {
          setIsLive(false);
          setCurrentStream((prev) =>
            prev ? { ...prev, status: "ended" } : null
          );
        });

        socket.on("live:stream_updated", (data: Partial<LiveStream>) => {
          setCurrentStream((prev) => (prev ? { ...prev, ...data } : null));
        });
      } catch (err) {
        console.error("[LiveContext] Socket connection failed:", err);
        setConnected(false);
      }
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("live:viewer_joined");
        socketRef.current.off("live:viewer_left");
        socketRef.current.off("live:new_comment");
        socketRef.current.off("live:reaction");
        socketRef.current.off("live:stream_ended");
        socketRef.current.off("live:stream_updated");
      }
    };
  }, []);

  // ============================================================================
  // BROADCASTER ACTIONS
  // ============================================================================

  const startLive = useCallback(
    async (
      title?: string,
      description?: string
    ): Promise<LiveStream | null> => {
      if (!user) {
        setError("Vui lòng đăng nhập để phát trực tiếp");
        return null;
      }

      setConnecting(true);
      setError(null);

      try {
        // Generate unique stream ID
        const streamId = `live_${user.id}_${Date.now()}`;
        streamIdRef.current = streamId;

        // Get LiveKit token for broadcasting
        const tokenResponse = await liveKitService.getLivestreamToken(
          streamId,
          String(user.id),
          user.name || "Broadcaster",
          true // isBroadcaster
        );

        if (!tokenResponse.success || !tokenResponse.data) {
          console.warn(
            "[LiveContext] Could not get LiveKit token, using local mode"
          );
        }

        // Create stream object
        const stream: LiveStream = {
          id: streamId,
          title: title || "Đang phát trực tiếp",
          description,
          hostId: String(user.id),
          hostName: user.name || "Unknown",
          hostAvatar: user.avatar,
          viewerCount: 0,
          likeCount: 0,
          status: "live",
          startedAt: new Date().toISOString(),
          roomName: tokenResponse?.data?.roomName,
        };

        // Emit to server
        socketRef.current?.emit("live:start", {
          streamId,
          title: stream.title,
          description,
          hostId: user.id,
          hostName: user.name,
        });

        setCurrentStream(stream);
        setIsLive(true);
        setIsBroadcaster(true);
        setComments([]);
        setReactions([
          { type: "like", count: 0 },
          { type: "heart", count: 0 },
          { type: "fire", count: 0 },
          { type: "star", count: 0 },
        ]);

        return stream;
      } catch (err: any) {
        console.error("[LiveContext] Start live error:", err);
        setError(err.message || "Không thể bắt đầu phát trực tiếp");
        return null;
      } finally {
        setConnecting(false);
      }
    },
    [user]
  );

  const stopLive = useCallback(async () => {
    if (!currentStream || !isBroadcaster) {
      // Legacy: just stop
      setIsLive(false);
      setViewerCount(0);
      return;
    }

    try {
      socketRef.current?.emit("live:stop", {
        streamId: currentStream.id,
      });

      setIsLive(false);
      setIsBroadcaster(false);
      setCurrentStream((prev) =>
        prev
          ? { ...prev, status: "ended", endedAt: new Date().toISOString() }
          : null
      );
      streamIdRef.current = null;
    } catch (err: any) {
      console.error("[LiveContext] Stop live error:", err);
      setError(err.message || "Không thể dừng phát trực tiếp");
    }
  }, [currentStream, isBroadcaster]);

  const updateStreamInfo = useCallback(
    async (title: string, description?: string) => {
      if (!currentStream || !isBroadcaster) return;

      socketRef.current?.emit("live:update", {
        streamId: currentStream.id,
        title,
        description,
      });

      setCurrentStream((prev) =>
        prev ? { ...prev, title, description } : null
      );
    },
    [currentStream, isBroadcaster]
  );

  // ============================================================================
  // VIEWER ACTIONS
  // ============================================================================

  const joinStream = useCallback(
    async (streamId: string): Promise<boolean> => {
      if (!user) {
        setError("Vui lòng đăng nhập để xem");
        return false;
      }

      setConnecting(true);
      setError(null);

      try {
        streamIdRef.current = streamId;

        // Get LiveKit token for viewing
        const tokenResponse = await liveKitService.getLivestreamToken(
          streamId,
          String(user.id),
          user.name || "Viewer",
          false // not broadcaster
        );

        if (!tokenResponse.success) {
          console.warn(
            "[LiveContext] Could not get viewer token, using mock mode"
          );
        }

        // Join stream room
        socketRef.current?.emit("live:join", {
          streamId,
          userId: user.id,
          userName: user.name,
        });

        setIsBroadcaster(false);
        setIsLive(true);

        return true;
      } catch (err: any) {
        console.error("[LiveContext] Join stream error:", err);
        setError(err.message || "Không thể tham gia stream");
        return false;
      } finally {
        setConnecting(false);
      }
    },
    [user]
  );

  const leaveStream = useCallback(() => {
    if (!streamIdRef.current) return;

    socketRef.current?.emit("live:leave", {
      streamId: streamIdRef.current,
      userId: user?.id,
    });

    setIsLive(false);
    setCurrentStream(null);
    setComments([]);
    streamIdRef.current = null;
  }, [user]);

  // ============================================================================
  // INTERACTION ACTIONS
  // ============================================================================

  const sendComment = useCallback(
    (content: string) => {
      if (!content.trim()) return;

      const comment: LiveComment = {
        id: `comment_${Date.now()}`,
        streamId: streamIdRef.current || "local",
        userId: user?.id ? String(user.id) : "guest",
        userName: user?.name || "Khách",
        userAvatar: user?.avatar,
        content: content.trim(),
        type: "text",
        timestamp: Date.now(),
      };

      if (streamIdRef.current) {
        socketRef.current?.emit("live:comment", comment);
      }

      // Optimistic update
      setComments((prev) => [...prev.slice(-99), comment]);
    },
    [user]
  );

  // Legacy alias
  const addComment = useCallback(
    (text: string) => {
      sendComment(text);
    },
    [sendComment]
  );

  const getComments = useCallback(
    (_videoId?: string) => {
      return comments;
    },
    [comments]
  );

  const addCommentFor = useCallback(
    (videoId: string, text: string) => {
      sendComment(text);
    },
    [sendComment]
  );

  const sendReaction = useCallback(
    (type: LiveReaction["type"]) => {
      if (streamIdRef.current) {
        socketRef.current?.emit("live:reaction", {
          streamId: streamIdRef.current,
          type,
          userId: user?.id,
        });
      }

      // Optimistic update
      setReactions((prev) =>
        prev.map((r) => (r.type === type ? { ...r, count: r.count + 1 } : r))
      );
    },
    [user]
  );

  const sendGift = useCallback(
    (giftType: string, amount: number = 1) => {
      if (!user) return;

      const comment: LiveComment = {
        id: `gift_${Date.now()}`,
        streamId: streamIdRef.current || "local",
        userId: String(user.id),
        userName: user.name || "Anonymous",
        userAvatar: user.avatar,
        content: `Đã gửi ${amount}x ${giftType}`,
        type: "gift",
        giftType,
        timestamp: Date.now(),
      };

      if (streamIdRef.current) {
        socketRef.current?.emit("live:gift", {
          streamId: streamIdRef.current,
          giftType,
          amount,
          userId: user.id,
          userName: user.name,
        });
      }

      setComments((prev) => [...prev.slice(-99), comment]);
    },
    [user]
  );

  // ============================================================================
  // FOLLOW SYSTEM
  // ============================================================================

  const isFollowing = useCallback(
    (hostId: string) => {
      return followedHosts.includes(hostId);
    },
    [followedHosts]
  );

  const toggleFollow = useCallback((hostId: string) => {
    setFollowedHosts((prev) =>
      prev.includes(hostId)
        ? prev.filter((id) => id !== hostId)
        : [...prev, hostId]
    );
  }, []);

  // ============================================================================
  // LIKES
  // ============================================================================

  const getLikes = useCallback(
    (_videoId?: string) => {
      return reactions.find((r) => r.type === "like")?.count || 0;
    },
    [reactions]
  );

  const isLiked = useCallback(
    (videoId?: string) => {
      return likedVideos.has(videoId || streamIdRef.current || "current");
    },
    [likedVideos]
  );

  const toggleLike = useCallback(
    (videoId?: string) => {
      const id = videoId || streamIdRef.current || "current";
      const wasLiked = likedVideos.has(id);

      setLikedVideos((prev) => {
        const next = new Set(prev);
        if (wasLiked) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      // Update reaction count
      setReactions((prev) =>
        prev.map((r) =>
          r.type === "like"
            ? { ...r, count: wasLiked ? Math.max(0, r.count - 1) : r.count + 1 }
            : r
        )
      );

      if (streamIdRef.current) {
        socketRef.current?.emit("live:like", {
          streamId: streamIdRef.current,
          liked: !wasLiked,
          userId: user?.id,
        });
      }
    },
    [likedVideos, user]
  );

  // ============================================================================
  // UI STATE
  // ============================================================================

  const toggleCommentsVisible = useCallback(() => {
    setCommentsVisible((prev) => !prev);
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: LiveContextType = {
    currentStream,
    isLive,
    isBroadcaster,
    viewerCount,
    comments,
    reactions,
    // Legacy compatibility
    viewers: viewerCount,
    current: currentStream,
    // Connection
    connected,
    connecting,
    error,
    // Broadcaster
    startLive,
    stopLive,
    updateStreamInfo,
    // Viewer
    joinStream,
    leaveStream,
    // Interactions
    sendComment,
    addComment,
    getComments,
    addCommentFor,
    sendReaction,
    sendGift,
    // Follow
    followedHosts,
    isFollowing,
    toggleFollow,
    // Likes
    likeCount: getLikes(),
    isLiked,
    getLikes,
    toggleLike,
    // UI
    commentsVisible,
    toggleCommentsVisible,
  };

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useLive() {
  const context = useContext(LiveContext);

  if (!context) {
    // Return default values for components outside provider
    return {
      currentStream: null,
      isLive: false,
      isBroadcaster: false,
      viewerCount: 0,
      viewers: 0,
      current: null,
      comments: [],
      reactions: [],
      connected: false,
      connecting: false,
      error: null,
      startLive: async () => null,
      stopLive: async () => {},
      updateStreamInfo: async () => {},
      joinStream: async () => false,
      leaveStream: () => {},
      sendComment: () => {},
      addComment: () => {},
      getComments: () => [],
      addCommentFor: () => {},
      sendReaction: () => {},
      sendGift: () => {},
      followedHosts: [],
      isFollowing: () => false,
      toggleFollow: () => {},
      likeCount: 0,
      isLiked: () => false,
      getLikes: () => 0,
      toggleLike: () => {},
      commentsVisible: true,
      toggleCommentsVisible: () => {},
    };
  }

  return context;
}

export default LiveContext;
