import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

/**
 * ProductOwnerBadge - Displays ownership information and permissions
 */

interface ProductOwnerBadgeProps {
  createdBy?: string;
  createdAt?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  creatorName?: string; // Optional: Display name of creator
}

export function ProductOwnerBadge({
  createdBy,
  createdAt,
  currentUserId,
  isAdmin = false,
  creatorName,
}: ProductOwnerBadgeProps) {
  const border = useThemeColor({}, 'border');
  const textMuted = useThemeColor({}, 'textMuted');
  const accent = useThemeColor({}, 'accent');
  const text = useThemeColor({}, 'text');

  const isOwner = currentUserId && createdBy === currentUserId;
  const canManage = isAdmin || isOwner;

  if (!createdBy) return null;

  const handleViewPermissions = () => {
    const permissionText = canManage
      ? isAdmin
        ? 'Bạn là Admin - Có toàn quyền quản lý sản phẩm này'
        : 'Bạn là chủ sở hữu - Có quyền chỉnh sửa/xóa sản phẩm này'
      : 'Bạn không có quyền chỉnh sửa sản phẩm này';

    Alert.alert('Thông tin phân quyền', permissionText, [{ text: 'Đóng' }]);
  };

  return (
    <Pressable
      style={[styles.container, { borderColor: border }]}
      onPress={handleViewPermissions}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={isOwner ? 'person-circle' : isAdmin ? 'shield-checkmark' : 'person'}
          size={16}
          color={canManage ? accent : textMuted}
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <ThemedText style={[styles.label, { color: textMuted }]}>Đăng bởi:</ThemedText>
          <ThemedText style={[styles.value, { color: text }]}>
            {creatorName || (isOwner ? 'Bạn' : `User ${createdBy.slice(0, 8)}`)}
          </ThemedText>
        </View>

        {createdAt && (
          <View style={styles.row}>
            <ThemedText style={[styles.label, { color: textMuted }]}>Ngày tạo:</ThemedText>
            <ThemedText style={[styles.value, { color: textMuted }]}>
              {new Date(createdAt).toLocaleDateString('vi-VN')}
            </ThemedText>
          </View>
        )}
      </View>

      {canManage && (
        <View style={[styles.badge, { backgroundColor: accent + '20' }]}>
          <Ionicons name={isAdmin ? 'shield' : 'create'} size={12} color={accent} />
          <ThemedText style={[styles.badgeText, { color: accent }]}>
            {isAdmin ? 'Admin' : 'Chủ SP'}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
