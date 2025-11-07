import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import { Linking, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

export type VideoPlayerProps = {
  uri?: string;
  asset?: number; // require('...')
  style?: StyleProp<ViewStyle>;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

const isYouTube = (u?: string) => !!u && /(youtube\.com|youtu\.be)/i.test(u);
const isFacebook = (u?: string) => !!u && /(facebook\.com|fb\.watch)/i.test(u);

/**
 * Cross-platform video player.
 * - Plays MP4/HLS (m3u8) via expo-video.
 * - Detects YouTube/Facebook URLs and opens them externally (embed requires WebView/SDK).
 * - Keep muted autoplay for better compatibility.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ uri, asset, style, autoPlay = true, loop = true, muted = true }) => {
  // Fallback for social links
  if (isYouTube(uri) || isFacebook(uri)) {
    return (
      <Pressable onPress={() => { if (uri) Linking.openURL(uri).catch(() => {}); }} style={[{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }, style]}
      >
        <Text style={{ color: '#fff', fontSize: 12 }}>Mở video</Text>
      </Pressable>
    );
  }

  // Determine video source (string URL or asset number from require)
  const videoSource = typeof asset === 'number' ? String(asset) : (uri || '');
  
  if (!videoSource) {
    return <View style={[{ backgroundColor: '#111' }, style]} />;
  }

  // Use expo-video hook
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = loop;
    player.muted = muted;
    if (autoPlay) {
      player.play();
    }
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

export default VideoPlayer;
