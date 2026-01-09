/**
 * Permission Management Screen
 * Super Admin only - manage roles and permissions
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useIsSuperAdmin, useUserRole } from '@/hooks/usePermissions';
import {
    ACTION_LABELS_VI,
    MODULE_LABELS_VI,
    PermissionAction,
    PermissionModule,
    ROLE_LABELS_VI,
    UserRole
} from '@/types/permission';
import { getRolePermissions, ROLE_PERMISSION_PRESETS } from '@/utils/permission-presets';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function PermissionManagement() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isSuperAdmin = useIsSuperAdmin();
  const currentRole = useUserRole();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Only super admin can access
  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return null;
  }

  const rolePreset = selectedRole ? getRolePermissions(selectedRole) : null;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quản lý phân quyền',
          headerStyle: { backgroundColor: colors.accent },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Role List */}
        <View style={styles.sidebar}>
          <Text style={[styles.sidebarTitle, { color: colors.text }]}>Vai trò</Text>
          <ScrollView>
            {ROLE_PERMISSION_PRESETS.map((preset) => {
              const isSelected = selectedRole === preset.role;
              const isCurrentRole = currentRole === preset.role;

              return (
                <TouchableOpacity
                  key={preset.role}
                  style={[
                    styles.roleItem,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedRole(preset.role)}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleItemHeader}>
                    <Text
                      style={[
                        styles.roleItemName,
                        { color: isSelected ? '#fff' : colors.text },
                      ]}
                    >
                      {ROLE_LABELS_VI[preset.role]}
                    </Text>
                    {isCurrentRole && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Bạn</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.roleItemLevel,
                      { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textMuted },
                    ]}
                  >
                    Cấp {preset.level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Permission Details */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {rolePreset ? (
            <ScrollView>
              <View style={styles.header}>
                <Text style={[styles.roleName, { color: colors.text }]}>
                  {ROLE_LABELS_VI[rolePreset.role]}
                </Text>
                <Text style={[styles.roleDescription, { color: colors.textMuted }]}>
                  {rolePreset.description}
                </Text>
                <View style={styles.roleMeta}>
                  <View style={[styles.levelBadge, { backgroundColor: colors.accent }]}>
                    <Ionicons name="star" size={14} color="#fff" />
                    <Text style={styles.levelBadgeText}>Cấp {rolePreset.level}</Text>
                  </View>
                  <View style={[styles.permCount, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="key" size={14} color={colors.accent} />
                    <Text style={[styles.permCountText, { color: colors.text }]}>
                      {rolePreset.permissions.length} modules
                    </Text>
                  </View>
                </View>
              </View>

              {/* Permissions by Module */}
              <View style={styles.permissionsList}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Quyền truy cập
                </Text>
                {rolePreset.permissions.map((perm) => (
                  <View
                    key={perm.module}
                    style={[
                      styles.permissionCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.permissionHeader}>
                      <Ionicons
                        name={getModuleIcon(perm.module)}
                        size={20}
                        color={colors.accent}
                      />
                      <Text style={[styles.moduleName, { color: colors.text }]}>
                        {MODULE_LABELS_VI[perm.module]}
                      </Text>
                    </View>
                    <View style={styles.actionsList}>
                      {perm.actions.map((action) => (
                        <View
                          key={action}
                          style={[styles.actionTag, { backgroundColor: getActionColor(action) }]}
                        >
                          <Text style={styles.actionTagText}>
                            {ACTION_LABELS_VI[action]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="key-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Chọn vai trò để xem chi tiết phân quyền
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

function getModuleIcon(module: PermissionModule): keyof typeof Ionicons.glyphMap {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    [PermissionModule.DASHBOARD]: 'grid-outline',
    [PermissionModule.PROJECTS]: 'folder-outline',
    [PermissionModule.TASKS]: 'checkbox-outline',
    [PermissionModule.BUDGET]: 'cash-outline',
    [PermissionModule.MATERIALS]: 'cube-outline',
    [PermissionModule.EQUIPMENT]: 'construct-outline',
    [PermissionModule.QC_QA]: 'shield-checkmark-outline',
    [PermissionModule.SAFETY]: 'warning-outline',
    [PermissionModule.DOCUMENTS]: 'document-text-outline',
    [PermissionModule.PHOTOS]: 'camera-outline',
    [PermissionModule.USERS]: 'people-outline',
    [PermissionModule.SETTINGS]: 'settings-outline',
  };

  return iconMap[module] || 'ellipse-outline';
}

function getActionColor(action: PermissionAction): string {
  const colorMap: Record<string, string> = {
    [PermissionAction.VIEW]: '#3b82f6',
    [PermissionAction.CREATE]: '#0066CC',
    [PermissionAction.EDIT]: '#0066CC',
    [PermissionAction.DELETE]: '#000000',
    [PermissionAction.APPROVE]: '#666666',
    [PermissionAction.EXPORT]: '#06b6d4',
    [PermissionAction.MANAGE]: '#0066CC',
  };

  return colorMap[action] || '#6b7280';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  sidebar: {
    width: 180,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 12,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  roleItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  roleItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roleItemName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  currentBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  roleItemLevel: {
    fontSize: 11,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  roleName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  roleMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  permCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  permCountText: {
    fontSize: 13,
    fontWeight: '500',
  },
  permissionsList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  permissionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  moduleName: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
  },
});
