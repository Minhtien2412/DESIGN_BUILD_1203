import { VideoView, useVideoPlayer } from 'expo-video';
import React from 'react';
import { Platform, ViewStyle } from 'react-native';

type Props = {
  uri: string;
  style?: ViewStyle | ViewStyle[] | any;
  contentFit?: 'cover' | 'contain';
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

export const InlineVideo: React.FC<Props> = ({
  uri,
  style,
  contentFit = 'cover',
  autoPlay = false,
  loop = true,
  muted = true,
}) => {
  const player = useVideoPlayer({ uri }, (p: any) => {
    try {
      if (loop) p.setIsLooping(true);
      if (muted) p.setIsMuted(true);
      if (autoPlay) p.play();
    } catch {}
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit={contentFit}
      {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : {})}
    />
  );
};

export default InlineVideo;
