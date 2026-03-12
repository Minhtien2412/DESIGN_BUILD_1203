/**
 * Video Wrapper - Compatibility layer for expo-av → expo-video migration
 * Use this wrapper to prepare for SDK 54 migration
 *
 * @description Provides unified video API that works with both expo-av and expo-video
 * @updated 2026-01-26
 */

/* eslint-disable react-hooks/rules-of-hooks -- This file intentionally uses hooks conditionally based on SDK version */

import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { StyleProp, ViewStyle } from "react-native";

// Try to import expo-video first, fallback to expo-av
let useExpoVideo = false;
let VideoModule: any = null;
let VideoComponent: any = null;

try {
  // Attempt to use new expo-video (SDK 54+)
  VideoModule = require("expo-video");
  VideoComponent = VideoModule.VideoView;
  useExpoVideo = true;
} catch {
  // Fallback to expo-av
  try {
    VideoModule = require("expo-av");
    VideoComponent = VideoModule.Video;
    useExpoVideo = false;
  } catch {
    console.warn("[VideoWrapper] No video module available");
  }
}

// ==================== TYPES ====================

export interface VideoPlayerState {
  isPlaying: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  duration: number;
  position: number;
  error: string | null;
  isMuted: boolean;
  volume: number;
}

export interface VideoPlayerRef {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  replay: () => Promise<void>;
}

export interface VideoPlayerProps {
  source: string | { uri: string };
  style?: StyleProp<ViewStyle>;
  resizeMode?: "contain" | "cover" | "stretch";
  shouldPlay?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  volume?: number;
  rate?: number;
  posterSource?: string | { uri: string };
  usePoster?: boolean;
  onLoad?: (status: VideoPlayerState) => void;
  onPlaybackStatusUpdate?: (status: VideoPlayerState) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onFullscreenUpdate?: (isFullscreen: boolean) => void;
}

// ==================== VIDEO PLAYER COMPONENT ====================

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      source,
      style,
      resizeMode = "contain",
      shouldPlay = false,
      isLooping = false,
      isMuted = false,
      volume = 1.0,
      rate = 1.0,
      posterSource,
      usePoster = true,
      onLoad,
      onPlaybackStatusUpdate,
      onError,
      onEnd,
      onFullscreenUpdate,
    },
    ref,
  ) => {
    const videoRef = useRef<any>(null);
    const playerRef = useRef<any>(null);

    const [state, setState] = useState<VideoPlayerState>({
      isPlaying: shouldPlay,
      isLoaded: false,
      isLoading: true,
      isBuffering: false,
      duration: 0,
      position: 0,
      error: null,
      isMuted: isMuted,
      volume: volume,
    });

    // Get source URI
    const sourceUri = typeof source === "string" ? source : source.uri;

    // expo-av status update handler
    const handleExpoAVStatus = useCallback(
      (status: any) => {
        if (status.isLoaded) {
          const newState: VideoPlayerState = {
            isPlaying: status.isPlaying,
            isLoaded: true,
            isLoading: false,
            isBuffering: status.isBuffering,
            duration: status.durationMillis || 0,
            position: status.positionMillis || 0,
            error: null,
            isMuted: status.isMuted,
            volume: status.volume,
          };

          setState(newState);
          onPlaybackStatusUpdate?.(newState);

          if (status.didJustFinish && !status.isLooping) {
            onEnd?.();
          }
        } else if (status.error) {
          const errorState = {
            ...state,
            error: status.error,
            isLoading: false,
          };
          setState(errorState);
          onError?.(status.error);
        }
      },
      [onPlaybackStatusUpdate, onEnd, onError, state],
    );

    // expo-video player creation (SDK 54+)
    const createExpoVideoPlayer = useCallback(() => {
      if (!useExpoVideo || !VideoModule) return null;

      const player = VideoModule.useVideoPlayer(sourceUri, (player: any) => {
        player.loop = isLooping;
        player.muted = isMuted;
        player.volume = volume;
        player.playbackRate = rate;

        if (shouldPlay) {
          player.play();
        }
      });

      playerRef.current = player;
      return player;
    }, [sourceUri, isLooping, isMuted, volume, rate, shouldPlay]);

    // Imperative handle for external control
    useImperativeHandle(
      ref,
      () => ({
        play: async () => {
          if (useExpoVideo && playerRef.current) {
            playerRef.current.play();
          } else if (videoRef.current) {
            await videoRef.current.playAsync();
          }
          setState((prev) => ({ ...prev, isPlaying: true }));
        },

        pause: async () => {
          if (useExpoVideo && playerRef.current) {
            playerRef.current.pause();
          } else if (videoRef.current) {
            await videoRef.current.pauseAsync();
          }
          setState((prev) => ({ ...prev, isPlaying: false }));
        },

        stop: async () => {
          if (useExpoVideo && playerRef.current) {
            playerRef.current.currentTime = 0;
            playerRef.current.pause();
          } else if (videoRef.current) {
            await videoRef.current.stopAsync();
          }
          setState((prev) => ({ ...prev, isPlaying: false, position: 0 }));
        },

        seekTo: async (position: number) => {
          if (useExpoVideo && playerRef.current) {
            playerRef.current.currentTime = position / 1000; // seconds
          } else if (videoRef.current) {
            await videoRef.current.setPositionAsync(position);
          }
          setState((prev) => ({ ...prev, position }));
        },

        setVolume: async (vol: number) => {
          if (useExpoVideo && playerRef.current) {
            playerRef.current.volume = vol;
          } else if (videoRef.current) {
            await videoRef.current.setVolumeAsync(vol);
          }
          setState((prev) => ({ ...prev, volume: vol }));
        },

        setMuted: async (muted: boolean) => {
          if (useExpoVideo && playerRef.current) {
            playerRef.current.muted = muted;
          } else if (videoRef.current) {
            await videoRef.current.setIsMutedAsync(muted);
          }
          setState((prev) => ({ ...prev, isMuted: muted }));
        },

        setRate: async (newRate: number) => {
          if (useExpoVideo && playerRef.current) {
            playerRef.current.playbackRate = newRate;
          } else if (videoRef.current) {
            await videoRef.current.setRateAsync(newRate, true);
          }
        },

        replay: async () => {
          if (useExpoVideo && playerRef.current) {
            playerRef.current.currentTime = 0;
            playerRef.current.play();
          } else if (videoRef.current) {
            await videoRef.current.replayAsync();
          }
          setState((prev) => ({ ...prev, isPlaying: true, position: 0 }));
        },
      }),
      [],
    );

    // No video module available
    if (!VideoComponent) {
      return null;
    }

    // expo-video (SDK 54+)
    if (useExpoVideo) {
      const player = createExpoVideoPlayer();

      return (
        <VideoComponent
          ref={videoRef}
          player={player}
          style={style}
          contentFit={resizeMode}
          nativeControls={false}
        />
      );
    }

    // expo-av (legacy)
    return (
      <VideoComponent
        ref={videoRef}
        source={typeof source === "string" ? { uri: source } : source}
        style={style}
        resizeMode={resizeMode}
        shouldPlay={shouldPlay}
        isLooping={isLooping}
        isMuted={isMuted}
        volume={volume}
        rate={rate}
        posterSource={
          posterSource
            ? typeof posterSource === "string"
              ? { uri: posterSource }
              : posterSource
            : undefined
        }
        usePoster={usePoster}
        onPlaybackStatusUpdate={handleExpoAVStatus}
        onLoad={(status: any) => {
          const loadState: VideoPlayerState = {
            isPlaying: status.isPlaying,
            isLoaded: true,
            isLoading: false,
            isBuffering: false,
            duration: status.durationMillis || 0,
            position: 0,
            error: null,
            isMuted: status.isMuted,
            volume: status.volume,
          };
          setState(loadState);
          onLoad?.(loadState);
        }}
        onError={(error: any) => {
          const errorMessage = error?.message || "Video playback error";
          setState((prev) => ({ ...prev, error: errorMessage }));
          onError?.(errorMessage);
        }}
        onFullscreenUpdate={(event: any) => {
          onFullscreenUpdate?.(
            event.fullscreenUpdate === 1 || event.fullscreenUpdate === 3,
          );
        }}
      />
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";

// ==================== HOOKS ====================

export function useVideoPlayer(source: string | null) {
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    isLoaded: false,
    isLoading: false,
    isBuffering: false,
    duration: 0,
    position: 0,
    error: null,
    isMuted: false,
    volume: 1.0,
  });

  const videoRef = useRef<VideoPlayerRef>(null);

  const play = useCallback(() => videoRef.current?.play(), []);
  const pause = useCallback(() => videoRef.current?.pause(), []);
  const stop = useCallback(() => videoRef.current?.stop(), []);
  const seekTo = useCallback(
    (position: number) => videoRef.current?.seekTo(position),
    [],
  );
  const setVolume = useCallback(
    (volume: number) => videoRef.current?.setVolume(volume),
    [],
  );
  const setMuted = useCallback(
    (muted: boolean) => videoRef.current?.setMuted(muted),
    [],
  );
  const replay = useCallback(() => videoRef.current?.replay(), []);

  return {
    videoRef,
    state,
    setState,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    setMuted,
    replay,
  };
}

// ==================== UTILITIES ====================

export const isExpoVideoAvailable = useExpoVideo;
export const isVideoModuleAvailable = VideoModule !== null;

export function getResizeMode(mode: "contain" | "cover" | "stretch"): string {
  if (useExpoVideo) {
    // expo-video uses contentFit
    return mode;
  }
  // expo-av uses resizeMode constants
  return mode;
}

export default VideoPlayer;
