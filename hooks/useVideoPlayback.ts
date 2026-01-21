/**
 * useVideoPlayback - Hook to integrate with VideoPlayerController
 *
 * Usage:
 * ```tsx
 * const { isPlaying, isMuted, play, pause, toggleMute } = useVideoPlayback(videoId);
 * ```
 */

import {
    VideoPlayerController,
    VideoPlayerState,
} from "@/services/VideoPlayerController";
import { VideoPlayer } from "expo-video";
import { useCallback, useEffect, useState } from "react";

interface UseVideoPlaybackOptions {
  autoRegister?: boolean;
  onPause?: () => void;
  onResume?: () => void;
}

interface UseVideoPlaybackReturn {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  savedPosition: number;
  play: () => void;
  pause: () => void;
  toggleMute: () => Promise<boolean>;
  setVolume: (volume: number) => void;
  registerPlayer: (player: VideoPlayer) => void;
  unregisterPlayer: () => void;
}

export function useVideoPlayback(
  videoId: string,
  options: UseVideoPlaybackOptions = {}
): UseVideoPlaybackReturn {
  const { autoRegister = true, onPause, onResume } = options;

  const [state, setState] = useState<VideoPlayerState>(() =>
    VideoPlayerController.getState()
  );

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = VideoPlayerController.subscribe(setState);
    return unsubscribe;
  }, []);

  // Register player with controller
  const registerPlayer = useCallback(
    (player: VideoPlayer) => {
      VideoPlayerController.registerPlayer(videoId, player, {
        onPause,
        onResume,
      });
    },
    [videoId, onPause, onResume]
  );

  // Unregister player on unmount
  const unregisterPlayer = useCallback(() => {
    VideoPlayerController.unregisterPlayer(videoId);
  }, [videoId]);

  // Auto-unregister on unmount
  useEffect(() => {
    return () => {
      VideoPlayerController.unregisterPlayer(videoId);
    };
  }, [videoId]);

  // Play this video
  const play = useCallback(() => {
    VideoPlayerController.play(videoId);
  }, [videoId]);

  // Pause this video
  const pause = useCallback(() => {
    VideoPlayerController.pause(videoId);
  }, [videoId]);

  // Toggle mute globally
  const toggleMute = useCallback(() => {
    return VideoPlayerController.toggleMute();
  }, []);

  // Set volume globally
  const setVolume = useCallback((volume: number) => {
    VideoPlayerController.setVolume(volume);
  }, []);

  return {
    isPlaying: state.activeVideoId === videoId,
    isMuted: state.isMuted,
    volume: state.volume,
    savedPosition: state.playbackPositions.get(videoId)?.position || 0,
    play,
    pause,
    toggleMute,
    setVolume,
    registerPlayer,
    unregisterPlayer,
  };
}

/**
 * useGlobalMute - Simple hook for global mute state
 */
export function useGlobalMute(): {
  isMuted: boolean;
  toggleMute: () => Promise<boolean>;
  setMuted: (muted: boolean) => Promise<void>;
} {
  const [isMuted, setIsMuted] = useState(() =>
    VideoPlayerController.getMuted()
  );

  useEffect(() => {
    const unsubscribe = VideoPlayerController.subscribe((state) => {
      setIsMuted(state.isMuted);
    });
    return unsubscribe;
  }, []);

  const toggleMute = useCallback(() => {
    return VideoPlayerController.toggleMute();
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    return VideoPlayerController.setMuted(muted);
  }, []);

  return { isMuted, toggleMute, setMuted };
}

/**
 * useActiveVideo - Get the currently active video
 */
export function useActiveVideo(): string | null {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(() =>
    VideoPlayerController.getActiveVideoId()
  );

  useEffect(() => {
    const unsubscribe = VideoPlayerController.subscribe((state) => {
      setActiveVideoId(state.activeVideoId);
    });
    return unsubscribe;
  }, []);

  return activeVideoId;
}
