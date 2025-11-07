import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Local VideoItem interface để tương thích với index.tsx
interface VideoItem { 
  id: string; 
  title: string; 
  localSource?: number; 
  videoUri?: string; 
  category: string; 
}

interface FullscreenVideoPlayerProps {
  item: VideoItem | null;
  visible: boolean;
  onClose: () => void;
}

const FullscreenVideoPlayer: React.FC<FullscreenVideoPlayerProps> = ({
  item,
  visible,
  onClose,
}) => {
  const [muted, setMuted] = useState(true); // Mặc định tắt tiếng như TikTok
  const [showControls, setShowControls] = useState(true);

  // Xác định source cho video từ localSource hoặc videoUri
  const videoSource = item ? (item.localSource || item.videoUri || '') : '';

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = muted;
  });

  useEffect(() => {
    if (visible && item) {
      player.play();
    } else {
      player.pause();
    }
  }, [visible, item, player]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && visible) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, visible]);

  const toggleControls = () => {
    setShowControls(true);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  if (!item) return null;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <StatusBar hidden />
      <View style={styles.container}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={toggleControls}
        >
          <VideoView
            style={StyleSheet.absoluteFill}
            player={player}
            contentFit="contain"
            nativeControls={false}
          />
        </TouchableOpacity>

        {/* Controls Overlay */}
        {showControls && (
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.controlsOverlay}
            pointerEvents="box-none"
          >
            <SafeAreaView style={styles.safeArea}>
              {/* Top Controls */}
              <View style={styles.topControls}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{item.title}</Text>
                  <Text style={styles.videoCategory}>{item.category}</Text>
                </View>

                <View style={styles.rightControls}>
                  {/* Mute/Unmute Button */}
                  <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
                    <Ionicons
                      name={muted ? 'volume-mute' : 'volume-high'}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>

                  {/* Like Button */}
                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="heart-outline" size={24} color="white" />
                    <Text style={styles.controlText}>0</Text>
                  </TouchableOpacity>

                  {/* Comment Button */}
                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="chatbubble-outline" size={24} color="white" />
                    <Text style={styles.controlText}>0</Text>
                  </TouchableOpacity>

                  {/* Share Button */}
                  <TouchableOpacity style={styles.controlButton}>
                    <Ionicons name="share-outline" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
  },
  videoInfo: {
    flex: 1,
    marginRight: 16,
  },
  videoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoCategory: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  rightControls: {
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FullscreenVideoPlayer;
