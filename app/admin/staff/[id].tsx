/**
 * Staff Detail Screen — Chi tiết nhân sự
 * Uses new role-based permission system from constants/staffPermissions
 */

import RoleBadge from "@/components/staff/RoleBadge";
import StatusBadge from "@/components/staff/StatusBadge";
import {
    canDeactivateStaff,
    canEditStaff,
    canViewStaffDetail,
} from "@/constants/staffPermissions";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useStaffDetail } from "@/hooks/useStaffDetail";
import { deactivateStaff } from "@/services/staffService";
import { COMPANY_ROLE_LABELS, CompanyRole } from "@/types/staff";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function StaffDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const staffId = id ? parseInt(id, 10) : null;
  const { staff, activityLog, reports, loading, error, refresh } =
    useStaffDetail(staffId);

  const userRole = useMemo<CompanyRole>(() => {
    const r = user?.role as CompanyRole | undefined;
    if (r && Object.values(CompanyRole).includes(r)) return r;
    if (user?.admin) return CompanyRole.ADMIN;
    return CompanyRole.STAFF;
  }, [user]);

  const canView = canViewStaffDetail(userRole) || !!user?.admin;
  const canEdit = canEditStaff(userRole) || !!user?.admin;
  const canDeactivate = canDeactivateStaff(userRole) || !!user?.admin;

  const handleEdit = () => {
    if (!canEdit) {
      Alert.alert("Không có quyền", "Bạn không có quyền chỉnh sửa nhân sự");
      return;
    }
    router.push(`/admin/staff/edit/${id}`);
  };

  const handleDeactivate = () => {
    if (!canDeactivate || !staffId) return;
    Alert.alert(
      "Xác nhận",
      `Bạn muốn vô hiệu hóa nhân sự "${staff?.full_name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Vô hiệu hóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deactivateStaff(staffId);
              Alert.alert("Thành công", "Đã vô hiệu hóa nhân sự");
              refresh();
            } catch (err: any) {
              Alert.alert("Lỗi", err?.message ?? "Không thể thực hiện");
            }
          },
        },
      ],
    );
  };

  // Guard
  if (!canView) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Chi tiết nhân sự" }} />
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.textMuted}
        />
        <Text style={[styles.guardText, { color: colors.text }]}>
          Không có quyền xem
        </Text>
      </View>
    );
  }

  // Loading
  if (loading && !staff) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: "Chi tiết nhân sự",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Đang tải...
        </Text>
      </View>
    );
  }

  // Error
  if (error || !staff) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: "Chi tiết nhân sự",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#fff",
          }}
        />
        <Ionicons name="warning-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || "Không tìm thấy nhân sự"}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          onPress={refresh}
        >
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = (staff.first_name?.[0] ?? "") + (staff.last_name?.[0] ?? "");

  return (
    <>
      <Stack.Screen
        options={{
          title: staff.full_name,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerRight: () =>
            canEdit ? (
              <TouchableOpacity onPress={handleEdit} style={styles.headerBtn}>
                <Ionicons name="create-outline" size={24} color="#fff" />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          {staff.avatar ? (
            <Image source={{ uri: staff.avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {initials.toUpperCase() || "?"}
              </Text>
            </View>
          )}

          <Text style={[styles.profileName, { color: colors.text }]}>
            {staff.full_name}
          </Text>

          {staff.job_title ? (
            <Text style={[styles.profileTitle, { color: colors.textMuted }]}>
              {staff.job_title}
            </Text>
          ) : null}

          <View style={styles.profileBadges}>
            <RoleBadge role={staff.role} />
            <StatusBadge status={staff.status} />
          </View>

          {staff.staff_code ? (
            <Text style={[styles.staffCode, { color: colors.textMuted }]}>
              Mã NV: {staff.staff_code}
            </Text>
          ) : null}
        </View>

        {/* Contact */}
        <Section title="Thông tin liên hệ" colors={colors}>
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={staff.email}
            colors={colors}
          />
          {staff.phone ? (
            <InfoRow
              icon="call-outline"
              label="Điện thoại"
              value={staff.phone}
              colors={colors}
            />
          ) : null}
        </Section>

        {/* Organization */}
        <Section title="Tổ chức" colors={colors}>
          <InfoRow
            icon="briefcase-outline"
            label="Vai trò"
            value={COMPANY_ROLE_LABELS[staff.role]}
            colors={colors}
          />
          {staff.department?.name ? (
            <InfoRow
              icon="business-outline"
              label="Phòng ban"
              value={staff.department.name}
              colors={colors}
            />
          ) : null}
          {staff.team?.name ? (
            <InfoRow
              icon="people-outline"
              label="Team"
              value={staff.team.name}
              colors={colors}
            />
          ) : null}
          {staff.manager?.full_name ? (
            <InfoRow
              icon="person-outline"
              label="Quản lý trực tiếp"
              value={staff.manager.full_name}
              colors={colors}
            />
          ) : null}
        </Section>

        {/* Skills */}
        {staff.skills && staff.skills.length > 0 && (
          <Section title="Kỹ năng / Chuyên môn" colors={colors}>
            <View style={styles.tags}>
              {staff.skills.map((s, i) => (
                <View
                  key={i}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: colors.primary + "15",
                      borderColor: colors.primary + "30",
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {s}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Current Projects */}
        {staff.current_projects && staff.current_projects.length > 0 && (
          <Section title="Dự án đang tham gia" colors={colors}>
            {staff.current_projects.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.projectRow,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => router.push(`/project/${p.id}` as any)}
              >
                <Ionicons
                  name="folder-outline"
                  size={18}
                  color={colors.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.projectName, { color: colors.text }]}>
                    {p.name}
                  </Text>
                  {p.role_in_project ? (
                    <Text
                      style={[styles.projectRole, { color: colors.textMuted }]}
                    >
                      {p.role_in_project}
                    </Text>
                  ) : null}
                </View>
                {p.status ? (
                  <Text
                    style={[styles.projectStatus, { color: colors.textMuted }]}
                  >
                    {p.status}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </Section>
        )}

        {/* Activity Log */}
        {activityLog.length > 0 && (
          <Section title="Lịch sử hoạt động" colors={colors}>
            {activityLog.slice(0, 10).map((item) => (
              <View
                key={item.id}
                style={[
                  styles.activityRow,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.activityDesc, { color: colors.text }]}>
                  {item.description}
                </Text>
                <Text
                  style={[styles.activityDate, { color: colors.textMuted }]}
                >
                  {new Date(item.created_at).toLocaleString("vi-VN")}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {/* Reports */}
        {reports.length > 0 && (
          <Section title="Báo cáo liên quan" colors={colors}>
            {reports.slice(0, 5).map((r) => (
              <View
                key={r.id}
                style={[
                  styles.activityRow,
                  { borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.activityDesc, { color: colors.text }]}>
                  {r.title}
                </Text>
                <Text
                  style={[styles.activityDate, { color: colors.textMuted }]}
                >
                  {new Date(r.submitted_at).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {/* Activity timestamps */}
        <Section title="Thông tin khác" colors={colors}>
          {staff.last_login ? (
            <InfoRow
              icon="time-outline"
              label="Đăng nhập cuối"
              value={new Date(staff.last_login).toLocaleString("vi-VN")}
              colors={colors}
            />
          ) : null}
          {staff.join_date ? (
            <InfoRow
              icon="calendar-outline"
              label="Ngày vào"
              value={new Date(staff.join_date).toLocaleDateString("vi-VN")}
              colors={colors}
            />
          ) : null}
          <InfoRow
            icon="calendar-outline"
            label="Ngày tạo"
            value={new Date(staff.created_at).toLocaleDateString("vi-VN")}
            colors={colors}
          />
        </Section>

        {/* Deactivate button */}
        {canDeactivate && staff.is_active && (
          <TouchableOpacity
            style={[styles.deactivateBtn, { borderColor: colors.error }]}
            onPress={handleDeactivate}
          >
            <Ionicons name="ban-outline" size={20} color={colors.error} />
            <Text style={[styles.deactivateText, { color: colors.error }]}>
              Vô hiệu hóa nhân sự
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

// ---- Sub-components ----

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        sectionStyles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[sectionStyles.title, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={sectionStyles.infoRow}>
      <View style={sectionStyles.infoLabel}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text
          style={[sectionStyles.infoLabelText, { color: colors.textMuted }]}
        >
          {label}
        </Text>
      </View>
      <Text style={[sectionStyles.infoValue, { color: colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  infoLabelText: {
    fontSize: 13,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    marginLeft: 24,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  guardText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  headerBtn: {
    marginRight: 12,
  },
  profileCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 14,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  profileBadges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  staffCode: {
    fontSize: 13,
    marginTop: 4,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: "600",
  },
  projectRole: {
    fontSize: 12,
    marginTop: 2,
  },
  projectStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  activityRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  activityDesc: {
    fontSize: 14,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
  },
  deactivateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  deactivateText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
