import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Loader } from "@/components/ui/loader";
import { Section } from "@/components/ui/section";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRoles } from "@/hooks/useAdmin";
import { hasPermission } from "@/utils/permissions";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

export default function RolesManagementScreen() {
  const { user } = useAuth();
  const iconColor = useThemeColor({}, "icon");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "tabIconDefault");
  const cardBg = useThemeColor({}, "surface");

  // Permission check
  useEffect(() => {
    if (!user?.admin || !hasPermission(user.permissions, "roles", "view")) {
      Alert.alert("Không có quyền", "Bạn không có quyền xem vai trò", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [user]);

  const { roles, loading, error, refresh } = useRoles();

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Loader />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Container>
          <Section>
            <ThemedText>Lỗi: {error}</ThemedText>
            <Button onPress={refresh}>Thử lại</Button>
          </Section>
        </Container>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={roles}
        keyExtractor={(item) => item.roleid.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Container>
            {/* Header */}
            <Section>
              <View style={styles.header}>
                <View>
                  <ThemedText type="title">Quản lý vai trò</ThemedText>
                  <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
                    {roles.length} vai trò
                  </ThemedText>
                </View>
                {hasPermission(user?.permissions, "roles", "create") && (
                  <Button
                    variant="default"
                    size="sm"
                    onPress={() =>
                      router.push("/coming-soon/roles-create" as any)
                    }
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                    <ThemedText style={styles.buttonText}>
                      Tạo vai trò
                    </ThemedText>
                  </Button>
                )}
              </View>
            </Section>
          </Container>
        }
        renderItem={({ item }) => (
          <Container fullWidth>
            <TouchableOpacity
              onPress={() => router.push(`/admin/roles/${item.roleid}`)}
              style={[
                styles.roleCard,
                { backgroundColor: cardBg, borderColor },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.roleHeader}>
                <View style={styles.roleIcon}>
                  <Ionicons
                    name="shield-checkmark"
                    size={24}
                    color={iconColor}
                  />
                </View>
                <View style={styles.roleInfo}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  <ThemedText style={[styles.roleStats, { color: mutedColor }]}>
                    {item.total_staff || 0} nhân viên •{" "}
                    {Object.keys(item.permissions).length} tính năng
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={mutedColor} />
              </View>

              {/* Permission Preview */}
              <View style={styles.permissionPreview}>
                {Object.entries(item.permissions)
                  .slice(0, 3)
                  .map(([feature, capabilities]) => (
                    <View
                      key={feature}
                      style={[styles.featureChip, { borderColor }]}
                    >
                      <ThemedText style={styles.featureText}>
                        {feature}
                      </ThemedText>
                      <ThemedText
                        style={[styles.capabilityCount, { color: mutedColor }]}
                      >
                        {(capabilities as string[]).length}
                      </ThemedText>
                    </View>
                  ))}
                {Object.keys(item.permissions).length > 3 && (
                  <View style={[styles.moreChip, { borderColor }]}>
                    <ThemedText
                      style={[styles.moreText, { color: mutedColor }]}
                    >
                      +{Object.keys(item.permissions).length - 3}
                    </ThemedText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Container>
        )}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 4,
  },
  roleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  roleInfo: {
    flex: 1,
  },
  roleStats: {
    fontSize: 13,
    marginTop: 4,
  },
  permissionPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  featureText: {
    fontSize: 12,
  },
  capabilityCount: {
    fontSize: 11,
    fontWeight: "600",
  },
  moreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  moreText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
