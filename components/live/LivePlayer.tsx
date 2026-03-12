/**
 * LivePlayer Component
 * Uses expo-video for playback
 */
import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface LivePlayerProps {
  source: string;
  autoPlay?: boolean;
  onError?: (message: string) => void;
}

export function LivePlayer({
  source,
  autoPlay = true,
  onError,
}: LivePlayerProps) {
  const player = useVideoPlayer(source, (player) => {
    player.loop = true;
  });
  const status = useEvent(player, "statusChange", { status: player.status });
  const playing = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isBuffering, setIsBuffering] = useState(false);
  const handleError = (message: string) => onError?.(message);

  useEffect(() => {
    setIsPlaying(playing.isPlaying);
  }, [playing.isPlaying]);

  useEffect(() => {
    setIsBuffering(status.status === "loading");
    if (status.status === "error") {
      handleError(status.error?.message || "Video error");
    }
  }, [status.status]);

  useEffect(() => {
    if (autoPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [autoPlay, player]);

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={togglePlay}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={22}
            color="#fff"
          />
        </Pressable>
        {isBuffering && (
          <View style={styles.buffering}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.bufferingText}>Buffering...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#111",
    borderRadius: 12,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  controls: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  buffering: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bufferingText: {
    color: "#fff",
    fontSize: 12,
  },
});
