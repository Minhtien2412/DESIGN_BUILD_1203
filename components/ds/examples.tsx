/**
 * Example: Module Screen using DS Layout Templates
 * Shows how any module folder screen can be migrated to DS.
 *
 * Pattern: Import DSModuleScreen/DSListScreen → wrap content → done.
 * No more inline COLORS, SPACING, or 500+ line StyleSheet blocks.
 */
import { DSBadge, DSCard, DSChip, DSInput } from "@/components/ds";
import {
    DSDashboardScreen,
    DSDetailScreen,
    DSFormScreen,
    DSListScreen,
    DSModuleScreen,
} from "@/components/ds/layouts";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Module Screen (e.g. Materials, Equipment, Inventory)
// ═══════════════════════════════════════════════════════════════════════
export function ExampleModuleScreen() {
  const { colors, radius, shadow } = useDS();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <DSModuleScreen
      title="Vật liệu xây dựng"
      subtitle="152 sản phẩm"
      gradientHeader
      refreshing={refreshing}
      onRefresh={handleRefresh}
      fab={{ icon: "add", onPress: () => console.log("Add new") }}
      headerRight={
        <Pressable style={{ padding: 4 }}>
          <Ionicons name="filter-outline" size={22} color="#FFF" />
        </Pressable>
      }
    >
      {/* Content goes here — just regular Views, no wrapper boilerplate */}
      <View style={{ padding: 16, gap: 12 }}>
        <DSCard variant="elevated" style={{ padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
            Xi măng Holcim PCB40
          </Text>
          <Text
            style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}
          >
            Bao 50kg • Kho Bình Dương
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <DSChip label="Còn hàng" selected />
            <DSBadge label="HOT" variant="error" />
          </View>
        </DSCard>

        <DSCard variant="elevated" style={{ padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
            Thép Hòa Phát D10
          </Text>
          <Text
            style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}
          >
            Thanh 11.7m • Nhà máy Hải Dương
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <DSChip label="Đặt hàng" />
          </View>
        </DSCard>
      </View>
    </DSModuleScreen>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 2: List Screen (e.g. Orders, Projects, Tasks)
// ═══════════════════════════════════════════════════════════════════════
interface TaskItem {
  id: string;
  title: string;
  status: "pending" | "done";
  assignee: string;
}

const SAMPLE_TASKS: TaskItem[] = [
  { id: "1", title: "Kiểm tra móng cọc", status: "done", assignee: "Nguyễn A" },
  { id: "2", title: "Đổ sàn tầng 3", status: "pending", assignee: "Trần B" },
  { id: "3", title: "Lắp đặt điện", status: "pending", assignee: "Lê C" },
];

export function ExampleListScreen() {
  const { colors, radius, shadow } = useDS();

  return (
    <DSListScreen<TaskItem>
      title="Danh sách công việc"
      subtitle="Dự án Sunrise Tower"
      data={SAMPLE_TASKS}
      keyExtractor={(item) => item.id}
      emptyTitle="Chưa có công việc"
      emptyMessage="Tạo công việc mới để bắt đầu"
      emptyIcon="clipboard-outline"
      fab={{ icon: "add", onPress: () => console.log("Add task") }}
      renderItem={({ item }) => (
        <Pressable
          style={[
            es.listItem,
            {
              backgroundColor: colors.bgSurface,
              borderBottomColor: colors.divider,
            },
          ]}
        >
          <Ionicons
            name={
              item.status === "done" ? "checkmark-circle" : "ellipse-outline"
            }
            size={24}
            color={
              item.status === "done" ? colors.success : colors.textTertiary
            }
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={{ fontSize: 15, fontWeight: "500", color: colors.text }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              {item.assignee}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
          />
        </Pressable>
      )}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 3: Detail Screen (e.g. Product detail, Contract detail)
// ═══════════════════════════════════════════════════════════════════════
export function ExampleDetailScreen() {
  const { colors, radius, shadow } = useDS();

  return (
    <DSDetailScreen
      title="Chi tiết hợp đồng"
      subtitle="HD-2025-0042"
      heroContent={
        <View
          style={{
            height: 200,
            backgroundColor: colors.primaryBg,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="document-text" size={64} color={colors.primary} />
        </View>
      }
      footer={
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            style={[
              es.footerBtn,
              {
                backgroundColor: colors.bgMuted,
                borderRadius: radius.md,
                flex: 1,
              },
            ]}
          >
            <Text style={{ color: colors.text, fontWeight: "600" }}>
              Từ chối
            </Text>
          </Pressable>
          <Pressable
            style={[
              es.footerBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.md,
                flex: 1,
              },
            ]}
          >
            <Text style={{ color: colors.white, fontWeight: "600" }}>
              Phê duyệt
            </Text>
          </Pressable>
        </View>
      }
    >
      <DSCard variant="outlined" style={{ padding: 16, marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
          Thông tin hợp đồng
        </Text>
        <View style={es.infoRow}>
          <Text style={[es.infoLabel, { color: colors.textSecondary }]}>
            Khách hàng
          </Text>
          <Text style={[es.infoValue, { color: colors.text }]}>
            Công ty ABC
          </Text>
        </View>
        <View style={es.infoRow}>
          <Text style={[es.infoLabel, { color: colors.textSecondary }]}>
            Giá trị
          </Text>
          <Text style={[es.infoValue, { color: colors.primary }]}>
            ₫2,500,000,000
          </Text>
        </View>
      </DSCard>
    </DSDetailScreen>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 4: Form Screen (e.g. Create project, Add worker)
// ═══════════════════════════════════════════════════════════════════════
export function ExampleFormScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <DSFormScreen
      title="Thêm công nhân"
      submitLabel="Thêm công nhân"
      onSubmit={() => console.log("Submit", { name, phone })}
      submitDisabled={!name || !phone}
    >
      <DSInput
        label="Họ và tên"
        placeholder="Nhập họ và tên..."
        value={name}
        onChangeText={setName}
      />
      <View style={{ height: 16 }} />
      <DSInput
        label="Số điện thoại"
        placeholder="0912 345 678"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
    </DSFormScreen>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLE 5: Dashboard Screen (e.g. Admin dashboard, CRM overview)
// ═══════════════════════════════════════════════════════════════════════
export function ExampleDashboardScreen() {
  const { colors, radius, shadow } = useDS();

  return (
    <DSDashboardScreen
      title="Tổng quan CRM"
      subtitle="Tháng 1/2025"
      gradientHeader
      stats={[
        {
          label: "Khách hàng",
          value: 156,
          icon: "people",
          color: colors.primary,
        },
        {
          label: "Doanh thu",
          value: "2.5B",
          icon: "trending-up",
          color: colors.success,
        },
        { label: "Đơn hàng", value: 42, icon: "cart", color: colors.info },
        { label: "Đánh giá", value: "4.8★", icon: "star", color: colors.gold },
      ]}
    >
      <View style={{ padding: 16 }}>
        <DSCard variant="elevated" style={{ padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
            Hoạt động gần đây
          </Text>
          <Text
            style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8 }}
          >
            Khách hàng mới: Công ty XYZ - 2 giờ trước
          </Text>
        </DSCard>
      </View>
    </DSDashboardScreen>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MINIMAL STYLES (only for examples)
// ═══════════════════════════════════════════════════════════════════════
const es = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  footerBtn: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "500" },
});
