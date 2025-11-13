import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Role } from '@/hooks/useAdmin';
import { usePermissionFeatures } from '@/hooks/useAdmin';
import { apiFetch } from '@/services/api';
import { hasPermission } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function RoleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'surface');

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { features, loading: featuresLoading } = usePermissionFeatures();

  // Permission check
  useEffect(() => {
    if (!user?.admin || !hasPermission(user.permissions, 'roles', 'view')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền xem vai trò', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [user]);

  // Fetch role detail
  useEffect(() => {
    const fetchRole = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiFetch<Role>(`/admin/roles/${id}`);
        setRole(response);
      } catch (err: any) {
        console.error('[RoleDetail] Fetch error:', err);
        setError(err.message || 'Không thể tải vai trò');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  // Handle delete
  const handleDelete = () => {
    if (!role) return;

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa vai trò "${role.name}"?\n\nLưu ý: Nhân viên có vai trò này sẽ cần được gán vai trò khác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/admin/roles/${id}`, { method: 'DELETE' });
              Alert.alert('Thành công', 'Vai trò đã được xóa', [
                { text: 'OK', onPress: () => router.replace('/admin/roles') }
              ]);
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa vai trò');
            }
          }
        }
      ]
    );
  };

  if (loading || featuresLoading) {
    return (
      <ThemedView style={styles.container}>
        <Loader />
      </ThemedView>
    );
  }

  if (error || !role) {
    return (
      <ThemedView style={styles.container}>
        <Container>
          <Section>
            <ThemedText>Lỗi: {error || 'Không tìm thấy vai trò'}</ThemedText>
            <Button onPress={() => router.back()}>Quay lại</Button>
          </Section>
        </Container>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container>
          {/* Header */}
          <Section>
            <View style={styles.header}>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={iconColor} />
              </Button>
              <View style={styles.titleContainer}>
                <ThemedText type="title">{role.name}</ThemedText>
                <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
                  {role.total_staff || 0} nhân viên
                </ThemedText>
              </View>
            </View>
          </Section>

          {/* Actions */}
          <Section>
            <View style={styles.actions}>
              {hasPermission(user?.permissions, 'roles', 'edit') && (
                <Button
                  variant="default"
                  onPress={() => router.push(`/admin/roles/edit/${id}`)}
                  style={styles.actionButton}
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <ThemedText style={styles.buttonText}>Chỉnh sửa</ThemedText>
                </Button>
              )}
              {hasPermission(user?.permissions, 'roles', 'delete') && (
                <Button
                  variant="destructive"
                  onPress={handleDelete}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <ThemedText style={styles.buttonText}>Xóa</ThemedText>
                </Button>
              )}
            </View>
          </Section>

          {/* Permissions Grid */}
          <Section>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Quyền hạn ({Object.keys(role.permissions).length} tính năng)
            </ThemedText>

            {features.map((feature) => {
              const roleCapabilities = role.permissions[feature.name] || [];
              
              return (
                <View key={feature.name} style={[styles.featureCard, { backgroundColor: cardBg, borderColor }]}>
                  <View style={styles.featureHeader}>
                    <ThemedText type="defaultSemiBold">{feature.label}</ThemedText>
                    <ThemedText style={[styles.featureCount, { color: mutedColor }]}>
                      {roleCapabilities.length}/{feature.capabilities.length}
                    </ThemedText>
                  </View>

                  <View style={styles.capabilitiesGrid}>
                    {feature.capabilities.map((capability) => {
                      const hasCapability = roleCapabilities.includes(capability.name);
                      
                      return (
                        <View
                          key={capability.name}
                          style={[
                            styles.capabilityChip,
                            { borderColor },
                            hasCapability && styles.capabilityActive
                          ]}
                        >
                          <Ionicons
                            name={hasCapability ? 'checkmark-circle' : 'close-circle-outline'}
                            size={16}
                            color={hasCapability ? '#10b981' : mutedColor}
                          />
                          <ThemedText
                            style={[
                              styles.capabilityText,
                              !hasCapability && { color: mutedColor }
                            ]}
                          >
                            {capability.label}
                          </ThemedText>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </Section>

          {/* Staff List (if available) */}
          {role.total_staff && role.total_staff > 0 && (
            <Section>
              <View style={styles.staffSection}>
                <ThemedText type="subtitle">Nhân viên có vai trò này</ThemedText>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push(`/admin/staff?role=${id}`)}
                >
                  Xem {role.total_staff} nhân viên
                  <Ionicons name="chevron-forward" size={16} color={iconColor} />
                </Button>
              </View>
            </Section>
          )}
        </Container>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    padding: 0,
  },
  titleContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#fff',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  capabilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  capabilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  capabilityActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  capabilityText: {
    fontSize: 13,
  },
  staffSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
