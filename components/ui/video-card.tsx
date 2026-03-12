import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/layout';
import { VideoItem } from '@/data/videos';
import { videoService } from '@/services/videoManager';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

interface VideoCardProps {
  video: VideoItem;
  showAuthor?: boolean;
  showStats?: boolean;
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function VideoCard({ video, showAuthor = true, showStats = true }: VideoCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const thumbnailUrl = videoService.getVideoThumbnailUrl(video.id);

  // Get video metadata for duration
  const videoMetadata = videoService.getVideo(video.id);
  const duration = videoMetadata?.duration;

  return (
    <View style={styles.card}>
      <Link href={`/video/${video.id}` as any} asChild>
        <Pressable style={styles.pressable}>
          <View style={styles.thumbnailContainer}>
            {imageLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
            {!imageError ? (
              <Image
                source={{ uri: thumbnailUrl }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={200}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            ) : (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>No thumbnail</ThemedText>
              </View>
            )}

            {/* Duration overlay */}
            {duration && (
              <View style={styles.durationOverlay}>
                <ThemedText style={styles.durationText}>
                  {formatDuration(duration)}
                </ThemedText>
              </View>
            )}

            {/* Live badge */}
            {video.type === 'live' && (
              <View style={styles.liveBadge}>
                <ThemedText style={styles.liveText}>LIVE</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.content}>
            <ThemedText numberOfLines={2} style={styles.title}>
              {video.title}
            </ThemedText>

            {showAuthor && video.author && (
              <ThemedText style={styles.author} numberOfLines={1}>
                {video.author}
              </ThemedText>
            )}

            {showStats && (
              <View style={styles.stats}>
                {video.likes !== undefined && (
                  <ThemedText style={styles.statText}>
                    {video.likes} likes
                  </ThemedText>
                )}
                {video.comments !== undefined && (
                  <ThemedText style={styles.statText}>
                    {video.comments} comments
                  </ThemedText>
                )}
              </View>
            )}
          </View>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: Radii.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  pressable: {
    width: '100%',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: '#666',
    fontSize: 12,
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#dc3545',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 11,
    color: '#888',
  },
});
