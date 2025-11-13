import { IconSymbol } from '@/components/ui/icon-symbol';
import LiveBadge from '@/components/ui/live-badge';
import { Loader } from '@/components/ui/loader';
import { DEFAULT_MUTED } from '@/constants/live';
import { usePlayer } from '@/context/PlayerContext';
import type { VideoItem } from '@/data/videos';
import { useLive } from '@/features/live';
import { saveVideoItemToLibrary } from '@/services/storage';
import { getPlayableUri, prefetchHls } from '@/services/videoCache';
import { getMutedPref, setMutedPref } from '@/utils/mediaPrefs';
import { openHashtag } from '@/utils/navigation';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Dimensions, Modal, Pressable, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReAnimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { height, width } = Dimensions.get('window');

type Props = {
  item: VideoItem;
  isActive: boolean;
  controlsVisible?: boolean;
  onUserInteract?: () => void;
  showLiveBadge?: boolean; // optional: force show live badge
  onTagPress?: (tag: string) => void;
  onAuthorPress?: (slugOrId: string) => void;
};

export default function LiveVideo({ item, isActive, controlsVisible, onUserInteract, showLiveBadge, onTagPress, onAuthorPress }: Props) {
  // Resolved/cached URL (falls back to original); for inline require() use number directly
  const [resolvedUrl, setResolvedUrl] = useState<string | number | null>(null);
  // Create video player instance using resolved URL when available
  const player = useVideoPlayer((resolvedUrl ?? item.url) as any, player => {
    player.loop = true;
    player.muted = DEFAULT_MUTED;
  });
  
  const { getLikes, isLiked, toggleLike, getComments, toggleCommentsVisible, isFollowing, toggleFollow, viewerCount, current } = useLive();
  // Default: có âm thanh (unmuted)
  const [muted, setMuted] = useState<boolean>(DEFAULT_MUTED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);
  // Container size no longer needed for centering logic, kept if future overlays want it
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width, height });
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bursts, setBursts] = useState<Array<{ id: string; x: number }>>([]);
  const [showControls, setShowControls] = useState(false);
  const [showRate2x, setShowRate2x] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [fullPopup, setFullPopup] = useState(false);
  const { open: openGlobalPlayer } = usePlayer();

  // Tap handling
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPlayingBeforeHoldRef = useRef(false);
  const lastTapRef = useRef(0);

  // Effect to play/pause based on isActive
  useEffect(() => {
    if (isActive && !isPausedByUser) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPausedByUser, player]);

  // Effect to handle mute
  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  // Load persisted mute preference on mount
  useEffect(() => {
    (async () => {
      const pref = await getMutedPref();
      setMuted(pref);
    })();
  }, []);

  // Effect to resolve and prefetch URL (HLS prefers local playlist cache); inline assets (number) skip this
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        // Inline asset (require): just use number directly
        if (typeof item.url === 'number') {
          if (alive) {
            setResolvedUrl(item.url);
            setError(null);
            setLoading(false);
          }
          return;
        }
        const isHls = /\.m3u8($|\?)/i.test(item.url);
        if (isHls) {
          // Try to prefetch a few segments to a local playlist for smoother start
          const local = await prefetchHls(item.url, 8);
          if (alive && local) {
            setResolvedUrl(local);
            setError(null);
            setLoading(false);
            return;
          }
        }
        // Fallback to any cached mapping (or original)
        const uri = await getPlayableUri(item.url);
        if (alive) {
          setResolvedUrl(uri);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (alive) {
          setError('Failed to load video');
          console.error('video resolve error:', err);
          setLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, [item.url]);

  const toggleMute = async () => {
    const newMuted = !muted;
    setMuted(newMuted);
    setMutedPref(newMuted).catch(() => {});
    onUserInteract?.();
  };

  const togglePlayPause = async () => {
    const newPaused = !isPausedByUser;
    setIsPausedByUser(newPaused);
    onUserInteract?.();
  };

  const handleTap = (e: GestureResponderEvent) => {
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 300;
    lastTapRef.current = now;

    if (isDoubleTap) {
      // Double tap to like
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      onLike();
      return;
    }

    // Single tap with delay
    singleTapTimerRef.current = setTimeout(() => {
      singleTapTimerRef.current = null;
      togglePlayPause();
    }, 200);
  };

  const onLike = () => {
    toggleLike(item.id);
    // Floating heart burst for visual feedback
    const id = `${Date.now()}_${Math.random().toString(36).slice(2,5)}`;
    setBursts((b) => [...b, { id, x: Math.random() * (width * 0.4) }]);
    setTimeout(() => setBursts((b) => b.filter((i) => i.id !== id)), 1200);
  };

  const openMiniPlayer = () => {
    // Only open when we have a URL string (HLS/MP4). Inline assets (number) are not supported in mini yet.
    const playable = typeof resolvedUrl === 'string' ? resolvedUrl : (typeof item.url === 'string' ? item.url : null);
    if (!playable) return;
    // Pause inline to avoid double audio
    try { player.pause(); } catch {}
    (openGlobalPlayer as any)({ type: 'uri', uri: playable, title: item.title }, { mode: 'floating' });
  };

  // For HLS, wait until resolvedUrl is ready; for MP4/inline assets, allow player to mount immediately
  const isHls = typeof item.url === 'string' && /\.m3u8($|\?)/i.test(item.url);
  if (isHls && !resolvedUrl && !error) {
    return (
      <View style={styles.page}>
        <Loader />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.page}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            onPress={() => {
              setError(null);
              setReloadKey(k => k + 1);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const followKey = item.authorSlug || item.author || item.id;
  const following = isFollowing(followKey);
  const followScale = useSharedValue(1);
  useEffect(() => {
    followScale.value = 0.92;
    followScale.value = withSpring(1, { damping: 12, stiffness: 160 });
  }, [following, followScale]);
  const followAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: followScale.value }] }));

  return (
    <>
    <View style={styles.page} onLayout={(e) => setContainerSize(e.nativeEvent.layout)}>
      {/* Full-bleed video surface: fill width/height; cover to ensure width is 100% */}
      <View style={styles.videoFrame}>
        <VideoView
          key={`${item.id}-${reloadKey}`}
          style={[StyleSheet.absoluteFill, fullPopup && { opacity: 0 }]}
          player={player}
          fullscreenOptions={{ enable: false }}
          contentFit={fitMode}
          nativeControls={false}
        />
      </View>

      {/* Overlay UI */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Tap area */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleTap}
        />

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <Loader />
          </View>
        )}

        {/* Play/Pause indicator */}
        {isPausedByUser && (
          <View style={styles.playPauseIndicator}>
            <IconSymbol size={64} name="play.fill" color="rgba(255,255,255,0.8)" />
          </View>
        )}

        {/* Floating hearts */}
        {bursts.map((burst) => (
          <FloatingHeart key={burst.id} x={burst.x} />
        ))}

  {/* Bottom UI (keeps live badge and minimal controls) */}
  <View style={styles.bottomUI}>
          {/* Live badge only for live items (and show live viewer count if this is the current stream) */}
          {(showLiveBadge ?? item.type === 'live') ? (
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
              <LiveBadge />
              {item.type === 'live' && current?.id === item.id ? (
                <View style={styles.viewersBadge}>
                  <Text style={styles.viewersText}>{viewerCount} đang xem</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          
          {/* Left space no longer contains author/caption (moved to bottom-right) */}
          <View style={{ flex: 1 }} />

          {/* Controls (mute) */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
              <IconSymbol size={24} name={muted ? 'speaker.slash.fill' : 'speaker.wave.2.fill'} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom-left info block: username, follow pill, audio row, caption + hashtags */}
        <View style={styles.leftInfo} pointerEvents="box-none">
          <View style={{ alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => onAuthorPress?.(item.authorSlug || item.author || item.id)}>
                <Text style={{ color: 'white', fontWeight: '800' }} numberOfLines={1}>
                  @{(item.authorSlug || item.author || 'an-danh')}
                </Text>
              </TouchableOpacity>
              <ReAnimated.View style={followAnimStyle}>
                <TouchableOpacity
                  style={[styles.followBtn, following && styles.followedBtn, { marginLeft: 10 }]}
                  onPress={() => toggleFollow(followKey)}
                  accessibilityLabel={following ? 'Đang theo dõi' : 'Theo dõi'}
                >
                  <IconSymbol
                    name={following ? 'checkmark' : 'plus'}
                    size={14}
                    color={following ? '#fff' : '#111'}
                  />
                  <Text style={[styles.followText, following && styles.followedText]}>
                    {following ? 'Đang theo dõi' : 'Theo dõi'}
                  </Text>
                </TouchableOpacity>
              </ReAnimated.View>
            </View>
            <View style={styles.audioRow}>
              <IconSymbol name="music.note" size={16} color="#fff" />
              <Text style={styles.audioText} numberOfLines={1}>Nhạc gốc - {(item.author || 'Ẩn danh')}</Text>
            </View>
            {(item.title || (item.hashtags && item.hashtags.length)) ? (
              <Text style={{ color: 'white', opacity: 0.95, marginTop: 6 }} numberOfLines={3}>
                {item.title ? `${item.title} ` : ''}
                {Array.isArray(item.hashtags) && item.hashtags.length
                  ? item.hashtags.map((tag, idx) => (
                      <Text
                        key={tag + idx}
                        style={{ color: '#86e1ff', fontWeight: '700' }}
                        onPress={() => {
                          const normalized = tag.replace(/^#/, '');
                          if (onTagPress) onTagPress(normalized); else openHashtag(normalized);
                        }}
                      >
                        {`${tag}${idx < (item.hashtags?.length ?? 0) - 1 ? ' ' : ''}`}
                      </Text>
                    ))
                  : null}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right side UI */}
        <View style={styles.rightUI}>
          {/* Like button */}
          <TouchableOpacity onPress={onLike} style={styles.actionButton}>
            <IconSymbol 
              size={32} 
              name={isLiked(item.id) ? "heart.fill" : "heart"} 
              color={isLiked(item.id) ? "#ff3040" : "white"} 
            />
            <Text style={styles.actionText}>{getLikes(item.id)}</Text>
          </TouchableOpacity>

          {/* Comments button opens in-screen comments sheet */}
          <TouchableOpacity 
            onPress={() => { (toggleCommentsVisible as any)(true); onUserInteract?.(); }} 
            style={styles.actionButton}
          >
            <IconSymbol size={32} name="bubble.left.fill" color="white" />
            <Text style={styles.actionText}>{getComments(item.id).length}</Text>
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity 
            onPress={() => Share.share({ message: `Check out this video: ${item.title}` })}
            style={styles.actionButton}
          >
            <IconSymbol size={32} name="square.and.arrow.up" color="white" />
          </TouchableOpacity>

          {/* Full-screen popup toggle */}
          <TouchableOpacity
            onPress={() => setFullPopup(v => !v)}
            style={styles.actionButton}
          >
            <IconSymbol size={28} name={fullPopup ? 'xmark' : 'arrow.up.left.and.arrow.down.right'} color="white" />
            <Text style={styles.actionText}>{fullPopup ? 'Đóng' : 'Full'}</Text>
          </TouchableOpacity>

          {/* Mini floating player (YouTube-like) */}
          <TouchableOpacity
            onPress={openMiniPlayer}
            style={styles.actionButton}
            disabled={!(typeof resolvedUrl === 'string' || typeof item.url === 'string')}
          >
            <IconSymbol size={28} name="rectangle.inset.filled.and.person.filled" color="white" />
            <Text style={styles.actionText}>Mini</Text>
          </TouchableOpacity>

            {/* Save button (MP4 only) */}
            <TouchableOpacity
              onPress={() => saveVideoItemToLibrary(item)}
              style={styles.actionButton}
            >
              <IconSymbol size={32} name="arrow.down.to.line" color="white" />
            </TouchableOpacity>

          {/* Overflow menu placeholder */}
          <TouchableOpacity
            onPress={() => Share.share({ message: `Báo cáo/Ẩn video: ${item.title}` })}
            style={styles.actionButton}
          >
            <IconSymbol size={28} name="ellipsis" color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
      {/* Full-screen landscape popup */}
      <Modal visible={fullPopup} transparent={false} animationType="fade" onRequestClose={() => setFullPopup(false)}>
        <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
          {/* Close button */}
          <TouchableOpacity onPress={() => setFullPopup(false)} style={{ position: 'absolute', top: 24, right: 20, zIndex: 2 }}>
            <IconSymbol name="xmark.circle.fill" size={28} color="#fff" />
          </TouchableOpacity>
          {/* Rotated landscape surface: width=screenHeight, height=screenWidth */}
          <View style={{ width: height, height: width, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '90deg' }] }}>
            <VideoView
              key={`popup-${item.id}-${reloadKey}`}
              style={StyleSheet.absoluteFill}
              player={player}
              fullscreenOptions={{ enable: false }}
              contentFit="cover"
              nativeControls={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

// Floating heart animation component
function FloatingHeart({ x }: { x: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withSpring(-150, { damping: 10, stiffness: 100 });
    opacity.value = withSpring(0, { damping: 10, stiffness: 100 });
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <ReAnimated.View style={[styles.floatingHeart, { left: x }, animatedStyle]}>
      <IconSymbol size={32} name="heart.fill" color="#ff3040" />
    </ReAnimated.View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoFrame: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  videoSurface: {
    left: 8,
    right: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playPauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
  },
  bottomUI: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
  rightUI: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
  },
  rightInfo: {
    position: 'absolute',
    right: 16,
    left: 100, // leave space so it doesn't overlap action stack on the right
    bottom: 32,
    // pointer events pass-through allowed by parent; keep content aligned to end
  },
  leftInfo: {
    position: 'absolute',
    left: 16,
    right: 100, // leave space for right-side action stack
    bottom: 32,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  audioText: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 12,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  floatingHeart: {
    position: 'absolute',
    bottom: 200,
  },
  viewersBadge: {
    position: 'absolute',
    top: 16,
    left: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewersText: { color: '#fff', fontWeight: '700' },
  followBtn: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followText: { color: '#fff', fontWeight: '700' },
  followedBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  followedText: {
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
