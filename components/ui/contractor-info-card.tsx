/**
 * ContractorInfoCard - Shared component to display contractor/user info
 * Used across product detail, service detail, company profile screens
 * Fetches user data from users.service.ts
 */
import { getUserById, type UserProfile } from '@/services/api/users.service';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Theme colors
const COLORS = {
  primary: '#0D9488', // Shopee orange
  primaryLight: 'rgba(238, 77, 45, 0.1)',
  success: '#0D9488',
  successLight: 'rgba(10, 104, 71, 0.1)',
  text: '#222',
  textSecondary: '#666',
  textMuted: '#999',
  background: '#fff',
  border: '#f0f0f0',
  star: '#fbbf24',
  online: '#0D9488',
};

export interface ContractorInfoCardProps {
  /** User/Contractor ID to fetch */
  userId: string;
  /** Pre-loaded user data (skip fetch if provided) */
  userData?: UserProfile;
  /** Show compact version */
  compact?: boolean;
  /** Show contact action bar at bottom */
  showContactBar?: boolean;
  /** Custom phone number (override user's phone) */
  phoneNumber?: string;
  /** On press card callback */
  onPress?: () => void;
  /** Hide certain sections */
  hideStats?: boolean;
  hideSkills?: boolean;
  /** Style variant */
  variant?: 'default' | 'card' | 'minimal';
}

export function ContractorInfoCard({
  userId,
  userData,
  compact = false,
  showContactBar = true,
  phoneNumber,
  onPress,
  hideStats = false,
  hideSkills = false,
  variant = 'default',
}: ContractorInfoCardProps) {
  const [user, setUser] = useState<UserProfile | null>(userData || null);
  const [loading, setLoading] = useState(!userData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      setUser(userData);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getUserById(userId);
        setUser(data);
      } catch (err) {
        console.error('[ContractorInfoCard] Error fetching user:', err);
        setError('Không thể tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, userData]);

  // Handle phone call
  const handleCall = () => {
    const phone = phoneNumber || user?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
    }
  };

  // Handle message/chat
  const handleMessage = () => {
    if (user?.id) {
      router.push(`/messages/${user.id}`);
    }
  };

  // Handle view profile
  const handleViewProfile = () => {
    if (onPress) {
      onPress();
    } else if (user?.id) {
      router.push(`/profile/${user.id}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={24} color={COLORS.textMuted} />
        <Text style={styles.errorText}>{error || 'Không có thông tin'}</Text>
      </View>
    );
  }

  // Compact version
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Pressable style={styles.compactContent} onPress={handleViewProfile}>
          {/* Avatar */}
          <View style={styles.compactAvatar}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.compactAvatarImage} />
            ) : (
              <View style={styles.compactAvatarPlaceholder}>
                <Text style={styles.compactAvatarText}>{user.name?.[0] || 'N'}</Text>
              </View>
            )}
            {user.online && <View style={styles.onlineDot} />}
          </View>

          {/* Info */}
          <View style={styles.compactInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.compactName} numberOfLines={1}>{user.name}</Text>
              {user.verified && (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              )}
            </View>
            <Text style={styles.compactRole}>{getRoleLabel(user.role)}</Text>
          </View>

          {/* Rating */}
          {user.rating && (
            <View style={styles.compactRating}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.compactRatingText}>{user.rating.toFixed(1)}</Text>
            </View>
          )}

          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </Pressable>

        {showContactBar && (
          <View style={styles.compactActions}>
            <Pressable style={styles.compactCallBtn} onPress={handleCall}>
              <Ionicons name="call-outline" size={18} color={COLORS.primary} />
            </Pressable>
            <Pressable style={styles.compactMessageBtn} onPress={handleMessage}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.success} />
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // Full version
  return (
    <View style={[styles.container, variant === 'card' && styles.cardVariant]}>
      {/* Header Section */}
      <Pressable style={styles.header} onPress={handleViewProfile}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user.name?.[0] || 'N'}</Text>
            </View>
          )}
          {user.online && <View style={styles.onlineBadge} />}
          {user.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color="#fff" />
            </View>
          )}
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
          </View>
          
          <Text style={styles.role}>{getRoleLabel(user.role)}</Text>
          
          {user.company && (
            <View style={styles.companyRow}>
              <Ionicons name="business-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.companyText} numberOfLines={1}>{user.company}</Text>
            </View>
          )}

          {/* Rating & Reviews */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.ratingText}>{user.rating?.toFixed(1) || '0.0'}</Text>
            </View>
            <Text style={styles.reviewCount}>
              ({user.reviewCount || 0} đánh giá)
            </Text>
            {user.yearsExperience && (
              <>
                <View style={styles.dot} />
                <Text style={styles.experience}>{user.yearsExperience} năm KN</Text>
              </>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
      </Pressable>

      {/* Stats Section */}
      {!hideStats && (
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.projectsCount || 0}</Text>
            <Text style={styles.statLabel}>Dự án</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.followersCount || 0}</Text>
            <Text style={styles.statLabel}>Theo dõi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
        </View>
      )}

      {/* Skills Section */}
      {!hideSkills && user.skills && user.skills.length > 0 && (
        <View style={styles.skillsSection}>
          <Text style={styles.skillsTitle}>Chuyên môn</Text>
          <View style={styles.skillsContainer}>
            {user.skills.slice(0, 4).map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {user.skills.length > 4 && (
              <View style={styles.skillMore}>
                <Text style={styles.skillMoreText}>+{user.skills.length - 4}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Bio Section */}
      {user.bio && (
        <View style={styles.bioSection}>
          <Text style={styles.bioText} numberOfLines={2}>{user.bio}</Text>
        </View>
      )}

      {/* Contact Action Bar */}
      {showContactBar && (
        <View style={styles.contactBar}>
          <Pressable 
            style={styles.callButton} 
            onPress={handleCall}
            android_ripple={{ color: COLORS.primaryLight }}
          >
            <Ionicons name="call" size={20} color={COLORS.primary} />
            <Text style={styles.callButtonText}>Gọi điện</Text>
          </Pressable>

          <Pressable 
            style={styles.contactButton} 
            onPress={handleMessage}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Liên hệ ngay</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// Helper function to get role label
function getRoleLabel(role?: string): string {
  const roleMap: Record<string, string> = {
    'ADMIN': 'Quản trị viên',
    'CLIENT': 'Khách hàng',
    'ENGINEER': 'Kỹ sư',
    'CONTRACTOR': 'Nhà thầu',
    'SELLER': 'Người bán',
    'ARCHITECT': 'Kiến trúc sư',
    'DESIGNER': 'Nhà thiết kế',
    'WORKER': 'Công nhân',
  };
  return roleMap[role || ''] || 'Người dùng';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  cardVariant: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  mainInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  role: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  companyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
  },
  experience: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Stats
  statsSection: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },

  // Skills
  skillsSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  skillsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.success,
  },
  skillMore: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillMoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },

  // Bio
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  bioText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Contact Bar (matching the Shopee-style from attachment)
  contactBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
    gap: 6,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    gap: 6,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Compact Version
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactAvatar: {
    position: 'relative',
  },
  compactAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  compactAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  compactRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  compactRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  compactActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  compactCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactMessageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ContractorInfoCard;
