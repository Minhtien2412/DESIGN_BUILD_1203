/**
 * Staff List Screen — Danh sách nhân sự nội bộ
 * Uses new role-based permission system from constants/staffPermissions
 */

import StaffCard from "@/components/staff/StaffCard";
import StaffFilters, {
    type StaffFilterValues,
} from "@/components/staff/StaffFilters";
import {
    canCreateStaff,
    canViewStaff,
    isInternalRole,
} from "@/constants/staffPermissions";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDepartments } from "@/hooks/useDepartments";
import { useStaffList } from "@/hooks/useStaffList";
import { useTeams } from "@/hooks/useTeams";
import { CompanyRole, type StaffMemberFull } from "@/types/staff";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function StaffListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();

  // Derive CompanyRole from user — fallback to STAFF
  const userRole = useMemo<CompanyRole>(() => {
    const r = user?.role as CompanyRole | undefined;
    if (r && Object.values(CompanyRole).includes(r)) return r;
    if (user?.admin) return CompanyRole.ADMIN;
    return CompanyRole.STAFF;
  }, [user]);

  // Permission guard
  const canView = canViewStaff(userRole) || !!user?.admin;
  const canCreate = canCreateStaff(userRole) || !!user?.admin;

  // Filters
  const [filterValues, setFilterValues] = useState<StaffFilterValues>({
    search: "",
  });

  // Data hooks
  const { departments } = useDepartments();
  const { teams } = useTeams();

  const { staff, pagination, loading, refreshing, error, refresh, loadMore } =
    useStaffList({
      filters: {
        search: filterValues.search || undefined,
        role: filterValues.role,
        department_id: filterValues.department_id,
        team_id: filterValues.team_id,
        status: filterValues.status,
      },
    });

  const handlePress = useCallback((item: StaffMemberFull) => {
    router.push(`/admin/staff/${item.id}`);
  }, []);

  const handleCreate = useCallback(() => {
    if (!canCreate) {
      Alert.alert("Không có quyền", "Bạn không có quyền tạo nhân sự mới");
      return;
    }
    router.push("/admin/staff/create");
  }, [canCreate]);

  // Guard: customer or no permission
  if (!isInternalRole(userRole) || !canView) {
    return (
      <View style={[styles.guard, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Nhân sự", headerShown: false }} />
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.textMuted}
        />
        <Text style={[styles.guardTitle, { color: colors.text }]}>
          Không có quyền truy cập
        </Text>
        <Text style={[styles.guardSubtitle, { color: colors.textMuted }]}>
          Bạn không có quyền xem danh sách nhân sự
        </Text>
      </View>
    );
  }

  // Renderers
  const renderItem = useCallback(
    ({ item }: { item: StaffMemberFull }) => (
      <StaffCard staff={item} onPress={() => handlePress(item)} />
    ),
    [handlePress],
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="people-outline" size={56} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          {filterValues.search
            ? "Không tìm thấy nhân sự phù hợp"
            : "Chưa có nhân sự nào"}
        </Text>
        {!filterValues.search && canCreate && (
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={handleCreate}
          >
            <Text style={styles.emptyBtnText}>Thêm nhân sự đầu tiên</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || staff.length === 0) return null;
    return (
      <ActivityIndicator
        style={{ paddingVertical: 16 }}
        color={colors.primary}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Quản lý nhân sự",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerRight: () =>
            canCreate ? (
              <TouchableOpacity onPress={handleCreate} style={styles.headerBtn}>
                <Ionicons name="add-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Summary bar */}
        <View style={[styles.summaryBar, { backgroundColor: colors.surface }]}>
          <SummaryChip
            icon="people"
            label="Tổng"
            value={pagination.total}
            color={colors.primary}
            colors={colors}
          />
          <TouchableOpacity
            style={styles.summaryLink}
            onPress={() => router.push("/admin/staff/departments" as any)}
          >
            <Ionicons name="business" size={16} color={colors.primary} />
            <Text style={[styles.summaryLinkText, { color: colors.primary }]}>
              Phòng ban
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.summaryLink}
            onPress={() => router.push("/admin/staff/teams" as any)}
          >
            <Ionicons name="git-branch" size={16} color={colors.primary} />
            <Text style={[styles.summaryLinkText, { color: colors.primary }]}>
              Teams
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <StaffFilters
          values={filterValues}
          onChange={setFilterValues}
          departments={departments}
          teams={teams}
        />

        {/* Error */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="warning-outline" size={18} color="#DC2626" />
            <Text style={styles.errorBannerText}>{error}</Text>
            <TouchableOpacity onPress={refresh} hitSlop={8}>
              <Text style={styles.retryLink}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        <FlatList
          data={staff}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
        />

        {/* Initial loading */}
        {loading && staff.length === 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Đang tải danh sách nhân sự...
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

// ---- Summary Chip ----

function SummaryChip({
  icon,
  label,
  value,
  color,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  colors: any;
}) {
  return (
    <View style={summaryStyles.chip}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[summaryStyles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[summaryStyles.label, { color: colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  guardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  guardSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  headerBtn: {
    marginRight: 12,
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  summaryLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryLinkText: {
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    paddingTop: 4,
    paddingBottom: 40,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyBtn: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#DC2626",
  },
  retryLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});
