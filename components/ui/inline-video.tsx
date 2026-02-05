/**
 * InlineVideo - Small inline video player
 *
 * Uses VideoPlayerController to ensure only 1 video plays at a time globally
 *
 * @updated 29/01/2026 - Integrated VideoPlayerController
 */
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect } from "react";
import { Platform, ViewStyle } from "react-native";

type Props = {
  uri: string;
  videoId?: string; // Unique ID for controller tracking
  style?: ViewStyle | ViewStyle[] | any;
  contentFit?: "cover" | "contain";
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  isActive?: boolean; // Whether this video should play
};

export const InlineVideo: React.FC<Props> = ({
  uri,
  videoId,
  style,
  contentFit = "cover",
  autoPlay = false,
  loop = true,
  muted = true,
  isActive = false,
}) => {
  // Generate unique ID if not provided
  const id = videoId || `inline-video-${uri.slice(-20)}`;

  // Use centralized video playback controller
  const { registerPlayer, play, pause } = useVideoPlayback(id);

  const player = useVideoPlayer({ uri }, (p: any) => {
    try {
      if (loop) p.setIsLooping(true);
      if (muted) p.setIsMuted(true);
      // Don't auto-play directly - let controller manage it
    } catch {}
  });

  // Register player with controller
  useEffect(() => {
    if (player) {
      registerPlayer(player);
    }
  }, [player, registerPlayer]);

  // Control playback through controller - ensures only 1 video plays
  useEffect(() => {
    if (isActive && autoPlay) {
      play();
    } else if (!isActive) {
      pause();
    }
  }, [isActive, autoPlay, play, pause]);

  return (
    <VideoView
      player={player}
      style={style}
      contentFit={contentFit}
      {...(Platform.OS === "android"
        ? { surfaceType: "textureView" as const }
        : {})}
    />
  );
};

export default InlineVideo;
