/**
 * Live Streaming Hook
 * React hook for managing live stream state and WebSocket events
 */

import { useAuth } from '@/context/AuthContext';
import {
    LiveStream,
    StreamComment,
    StreamReaction,
    createLiveStream,
    endStream,
    getStreamComments,
    joinStream,
    leaveStream,
    sendStreamComment,
    sendStreamReaction,
    startStream,
} from '@/services/liveStream';
import socketManager from '@/services/socket';
import { useEffect, useRef, useState } from 'react';

interface UseLiveStreamOptions {
  streamId?: string;
  autoJoin?: boolean;
  onViewerCountChange?: (count: number) => void;
  onNewComment?: (comment: StreamComment) => void;
  onReaction?: (reaction: StreamReaction) => void;
  onStreamEnd?: () => void;
}

export function useLiveStream(options: UseLiveStreamOptions = {}) {
  const { user } = useAuth();
  const { streamId, autoJoin = false } = options;

  const [stream, setStream] = useState<LiveStream | null>(null);
  const [comments, setComments] = useState<StreamComment[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasJoinedRef = useRef(false);

  // Join stream on mount if autoJoin
  useEffect(() => {
    if (streamId && autoJoin && !hasJoinedRef.current) {
      handleJoinStream();
      hasJoinedRef.current = true;
    }

    return () => {
      if (streamId && isJoined) {
        handleLeaveStream();
      }
    };
  }, [streamId, autoJoin]);

  // Setup WebSocket listeners
  useEffect(() => {
    if (!streamId) return;

    const socket = socketManager.getSocket();
    if (!socket) return;

    // Listen for viewer count updates
    const handleViewerUpdate = (data: { streamId: string; count: number }) => {
      if (data.streamId === streamId) {
        setViewerCount(data.count);
        options.onViewerCountChange?.(data.count);
      }
    };

    // Listen for new comments
    const handleNewComment = (comment: StreamComment) => {
      if (comment.streamId === streamId) {
        setComments((prev) => [...prev, comment]);
        options.onNewComment?.(comment);
      }
    };

    // Listen for reactions
    const handleReaction = (data: { streamId: string; reaction: StreamReaction }) => {
      if (data.streamId === streamId) {
        options.onReaction?.(data.reaction);
      }
    };

    // Listen for stream end
    const handleStreamEnd = (data: { streamId: string }) => {
      if (data.streamId === streamId) {
        setStream((prev) => (prev ? { ...prev, status: 'ended' } : null));
        options.onStreamEnd?.();
      }
    };

    socket.on('stream:viewer-count', handleViewerUpdate);
    socket.on('stream:comment', handleNewComment);
    socket.on('stream:reaction', handleReaction);
    socket.on('stream:ended', handleStreamEnd);

    // Join stream room
    socket.emit('stream:join', { streamId });

    return () => {
      socket.off('stream:viewer-count', handleViewerUpdate);
      socket.off('stream:comment', handleNewComment);
      socket.off('stream:reaction', handleReaction);
      socket.off('stream:ended', handleStreamEnd);
      socket.emit('stream:leave', { streamId });
    };
  }, [streamId]);

  /**
   * Join stream as viewer
   */
  const handleJoinStream = async () => {
    if (!streamId || isJoined) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await joinStream(streamId);
      setIsJoined(true);
      
      // Load initial comments
      const initialComments = await getStreamComments(streamId, 50);
      setComments(initialComments);

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to join stream';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Leave stream
   */
  const handleLeaveStream = async () => {
    if (!streamId || !isJoined) return;

    try {
      await leaveStream(streamId);
      setIsJoined(false);
    } catch (err: any) {
      console.error('Failed to leave stream:', err);
    }
  };

  /**
   * Create and start a new stream
   */
  const createAndStartStream = async (title: string, description?: string, projectId?: string) => {
    if (!user) {
      throw new Error('Must be logged in to create stream');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create stream
      const newStream = await createLiveStream({
        title,
        description,
        projectId,
        settings: {
          quality: 'auto',
          enableChat: true,
          enableReactions: true,
          isPrivate: false,
        },
      });

      setStream(newStream);

      // Start stream
      const startedStream = await startStream(newStream.id);
      setStream(startedStream);

      return startedStream;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create stream';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * End current stream
   */
  const endCurrentStream = async () => {
    if (!stream) return;

    try {
      setIsLoading(true);
      const endedStream = await endStream(stream.id);
      setStream(endedStream);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to end stream';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send a comment
   */
  const postComment = async (message: string) => {
    if (!streamId || !user) return;

    try {
      const comment = await sendStreamComment(streamId, message);
      // Comment will be added via WebSocket event
      return comment;
    } catch (err: any) {
      console.error('Failed to send comment:', err);
      throw err;
    }
  };

  /**
   * Send a reaction
   */
  const sendReaction = async (type: StreamReaction['type']) => {
    if (!streamId) return;

    try {
      await sendStreamReaction(streamId, type);
    } catch (err: any) {
      console.error('Failed to send reaction:', err);
    }
  };

  return {
    stream,
    comments,
    viewerCount,
    isLoading,
    isJoined,
    error,
    joinStream: handleJoinStream,
    leaveStream: handleLeaveStream,
    createAndStartStream,
    endStream: endCurrentStream,
    postComment,
    sendReaction,
  };
}
