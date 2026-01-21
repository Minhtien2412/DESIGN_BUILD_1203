/**
 * External Content Section Component
 * Hiển thị nội dung bổ sung từ API external (Pexels, GNews)
 * Dùng khi không có dữ liệu từ database
 * 
 * @created 16/01/2026
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    ExternalArticle,
    ExternalPhoto,
    ExternalVideo,
} from '@/services/externalContentService';

const { width } = Dimensions.get('window');

// ==================== COLORS ====================

const COLORS = {
  bg: '#F8F9FA',
  white: '#FFFFFF',
  primary: '#7CB342',
  secondary: '#FF7043',
  text: '#212121',
  textLight: '#757575',
  textMuted: '#9E9E9E',
  border: '#E0E0E0',
  external: '#2196F3', // Badge color for external content
  overlay: 'rgba(0,0,0,0.4)',
};

// ==================== EXTERNAL VIDEO CARD ====================

interface ExternalVideoCardProps {
  video: ExternalVideo;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const ExternalVideoCard = memo(function ExternalVideoCard({
  video,
  onPress,
  size = 'medium',
}: ExternalVideoCardProps) {
  const dimensions = {
    small: { width: 120, height: 180 },
    medium: { width: 160, height: 240 },
    large: { width: width - 32, height: 200 },
  };

  const { width: cardWidth, height: cardHeight } = dimensions[size];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to video player or open URL
      router.push({
        pathname: '/social/reels-viewer',
        params: { videoUrl: video.videoUrl, title: video.title },
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.videoCard, { width: cardWidth, height: cardHeight }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.videoGradient}
      >
        {/* External badge */}
        <View style={styles.externalBadge}>
          <Ionicons name="globe-outline" size={10} color="#FFF" />
          <Text style={styles.externalBadgeText}>Pexels</Text>
        </View>

        {/* Duration */}
        <View style={styles.durationBadge}>
          <Ionicons name="play" size={10} color="#FFF" />
          <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title}
        </Text>

        {/* Author */}
        <Text style={styles.videoAuthor} numberOfLines={1}>
          {video.author.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// ==================== EXTERNAL ARTICLE CARD ====================

interface ExternalArticleCardProps {
  article: ExternalArticle;
  onPress?: () => void;
  layout?: 'horizontal' | 'vertical';
}

export const ExternalArticleCard = memo(function ExternalArticleCard({
  article,
  onPress,
  layout = 'horizontal',
}: ExternalArticleCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Open article URL in browser
      Linking.openURL(article.url).catch(console.error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (layout === 'vertical') {
    return (
      <TouchableOpacity
        style={styles.articleCardVertical}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image source={{ uri: article.image }} style={styles.articleImageVertical} />
        
        <View style={styles.articleContent}>
          {/* External badge */}
          <View style={styles.articleExternalBadge}>
            <Ionicons name="globe-outline" size={10} color={COLORS.external} />
            <Text style={styles.articleSourceText}>{article.source.name}</Text>
          </View>

          <Text style={styles.articleTitle} numberOfLines={2}>
            {article.title}
          </Text>
          
          <Text style={styles.articleDescription} numberOfLines={2}>
            {article.description}
          </Text>
          
          <Text style={styles.articleDate}>{formatDate(article.publishedAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.articleCardHorizontal}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: article.image }} style={styles.articleImageHorizontal} />
      
      <View style={styles.articleContentHorizontal}>
        {/* External badge */}
        <View style={styles.articleExternalBadge}>
          <Ionicons name="globe-outline" size={10} color={COLORS.external} />
          <Text style={styles.articleSourceText}>{article.source.name}</Text>
        </View>

        <Text style={styles.articleTitleSmall} numberOfLines={2}>
          {article.title}
        </Text>
        
        <Text style={styles.articleDate}>{formatDate(article.publishedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
});

// ==================== EXTERNAL PHOTO CARD ====================

interface ExternalPhotoCardProps {
  photo: ExternalPhoto;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const ExternalPhotoCard = memo(function ExternalPhotoCard({
  photo,
  onPress,
  size = 'medium',
}: ExternalPhotoCardProps) {
  const dimensions = {
    small: { width: 100, height: 100 },
    medium: { width: 150, height: 150 },
    large: { width: (width - 48) / 2, height: 200 },
  };

  const { width: cardWidth, height: cardHeight } = dimensions[size];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Open full image or photo detail
      Linking.openURL(photo.url).catch(console.error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.photoCard, { width: cardWidth, height: cardHeight }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: photo.thumbnail }}
        style={styles.photoImage}
        resizeMode="cover"
      />
      
      {/* External badge */}
      <View style={styles.photoExternalBadge}>
        <Ionicons name="camera-outline" size={10} color="#FFF" />
        <Text style={styles.photoBadgeText}>Pexels</Text>
      </View>

      {/* Photographer */}
      <View style={styles.photographerBadge}>
        <Text style={styles.photographerText} numberOfLines={1}>
          📷 {photo.photographer}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// ==================== SECTION COMPONENTS ====================

interface ExternalVideoSectionProps {
  videos: ExternalVideo[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  onSeeAll?: () => void;
}

export const ExternalVideoSection = memo(function ExternalVideoSection({
  videos,
  title = 'Video tham khảo',
  subtitle = 'Nội dung từ Pexels',
  isLoading,
  onSeeAll,
}: ExternalVideoSectionProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải video...</Text>
      </View>
    );
  }

  if (videos.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ExternalVideoCard video={item} size="medium" />
        )}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
});

interface ExternalNewsSectionProps {
  articles: ExternalArticle[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  layout?: 'horizontal' | 'vertical';
  onSeeAll?: () => void;
}

export const ExternalNewsSection = memo(function ExternalNewsSection({
  articles,
  title = 'Tin tham khảo',
  subtitle = 'Tin tức từ GNews',
  isLoading,
  layout = 'horizontal',
  onSeeAll,
}: ExternalNewsSectionProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải tin tức...</Text>
      </View>
    );
  }

  if (articles.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {layout === 'horizontal' ? (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ExternalArticleCard article={item} layout="vertical" />
          )}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />
      ) : (
        <View style={styles.verticalList}>
          {articles.slice(0, 5).map((article) => (
            <ExternalArticleCard
              key={article.id}
              article={article}
              layout="horizontal"
            />
          ))}
        </View>
      )}
    </View>
  );
});

interface ExternalPhotoSectionProps {
  photos: ExternalPhoto[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  onSeeAll?: () => void;
}

export const ExternalPhotoSection = memo(function ExternalPhotoSection({
  photos,
  title = 'Ảnh tư liệu',
  subtitle = 'Ảnh từ Pexels',
  isLoading,
  onSeeAll,
}: ExternalPhotoSectionProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải ảnh...</Text>
      </View>
    );
  }

  if (photos.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ExternalPhotoCard photo={item} size="medium" />
        )}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
});

// ==================== EMPTY STATE WITH EXTERNAL ====================

interface EmptyWithExternalProps {
  message?: string;
  videos?: ExternalVideo[];
  articles?: ExternalArticle[];
  isLoading?: boolean;
}

export const EmptyWithExternal = memo(function EmptyWithExternal({
  message = 'Chưa có dữ liệu',
  videos = [],
  articles = [],
  isLoading,
}: EmptyWithExternalProps) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyMessage}>{message}</Text>
      <Text style={styles.emptySubtitle}>Xem nội dung tham khảo bên dưới</Text>

      {videos.length > 0 && (
        <ExternalVideoSection
          videos={videos}
          title="🎬 Video giải trí"
          subtitle="Video xây dựng từ Pexels"
          isLoading={isLoading}
        />
      )}

      {articles.length > 0 && (
        <ExternalNewsSection
          articles={articles}
          title="📰 Tin tham khảo"
          subtitle="Tin tức từ GNews"
          isLoading={isLoading}
          layout="vertical"
        />
      )}
    </View>
  );
});

// ==================== STYLES ====================

const styles = StyleSheet.create({
  // Video Card
  videoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.bg,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 40,
  },
  externalBadge: {
    position: 'absolute',
    top: -30,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.external,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  externalBadgeText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '600',
  },
  durationBadge: {
    position: 'absolute',
    top: -30,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  durationText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '500',
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  videoAuthor: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },

  // Article Card - Vertical
  articleCardVertical: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleImageVertical: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 10,
  },
  articleExternalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  articleSourceText: {
    fontSize: 10,
    color: COLORS.external,
    fontWeight: '500',
  },
  articleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  articleDescription: {
    fontSize: 11,
    color: COLORS.textLight,
    lineHeight: 16,
    marginBottom: 6,
  },
  articleDate: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // Article Card - Horizontal
  articleCardHorizontal: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  articleImageHorizontal: {
    width: 100,
    height: 80,
    resizeMode: 'cover',
  },
  articleContentHorizontal: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  articleTitleSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 16,
  },

  // Photo Card
  photoCard: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.bg,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoExternalBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.external,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  photoBadgeText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '600',
  },
  photographerBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  photographerText: {
    fontSize: 9,
    color: '#FFF',
  },

  // Section
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  verticalList: {
    paddingHorizontal: 16,
  },

  // Loading
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    paddingTop: 20,
  },
  emptyMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
});
