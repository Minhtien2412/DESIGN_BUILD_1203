/**
 * Departments Management Screen — Quản lý phòng ban
 * New permission system from constants/staffPermissions
 */

import {
    canManageDepartments,
    canViewDepartment,
} from "@/constants/staffPermissions";/**
 * Departments Management Screen — Quản lý phòng ban
 * New permission system from constants/staffPermissions
 */

import {
    canManageDepartments,
    canViewDepartment,
} from "@/constants/staffPermissions";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDepartments } from "@/hooks/useDepartments";
import { createDepartment, updateDepartment } from "@/services/staffService";
import { CompanyRole, type Department } from "@/types/staff";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function DepartmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();

  const userRole = useMemo<CompanyRole>(() => {
    const r = user?.role as CompanyRole | undefined;
    if (r && Object.values(CompanyRole).includes(r)) return r;
    if (user?.admin) return CompanyRole.ADMIN;
    return CompanyRole.STAFF;
  }, [user]);

  const canView = canViewDepartment(userRole) || !!user?.admin;
  const canManage = canManageDepartments(userRole) || !…
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDepartments } from "@/hooks/useDepartments";
import { createDepartment, updateDepartment } from "@/services/staffService";
import { CompanyRole, type Department } from "@/types/staff";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function DepartmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();

  const userRole = useMemo<CompanyRole>(() => {
    const r = user?.role as CompanyRole | undefined;
    if (r && Object.values(CompanyRole).includes(r)) return r;
    if (user?.admin) return CompanyRole.ADMIN;
    return CompanyRole.STAFF;
  }, [user]);

  const canView = canViewDepartment(userRole) || !!user?.admin;
  const canManage = canManageDepartments(userRole) || !!user?.admin;

  const { departments, loading, error, refresh } = useDepartments(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = useCallback(() => {
    setEditingDept(null);
    setFormName("");
    setFormDesc("");
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((dept: Department) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormDesc(dept.description ?? "");
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên phòng ban");
      return;
    }
    setSaving(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, {
          name: formName.trim(),
          description: formDesc.trim() || undefined,
        });
        Alert.alert("Thành công", "Phòng ban đã được cập nhật");
      } else {
        await createDepartment({
          name: formName.trim(),
          description: formDesc.trim() || undefined,
        });
        Alert.alert("Thành công", "Phòng ban đã được tạo");
      }
      setModalVisible(false);
      refresh();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không thể lưu phòng ban");
    } finally {
      setSaving(false);
    }
  }, [editingDept, formName, formDesc, refresh]);

  // Guard
  if (!canView) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Phòng ban" }} />
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.textMuted}
        />
        <Text style={[styles.guardText, { color: colors.text }]}>
          Không có quyền xem phòng ban
        </Text>
      </View>
    );
  }

  const renderDept = ({ item }: { item: Department }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={() => canManage && openEdit(item)}
      activeOpacity={canManage ? 0.7 : 1}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.primary + "15" },
          ]}
        >
          <Ionicons name="business-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardName, { color: colors.text }]}>
            {item.name}
          </Text>
          {item.description ? (
            <Text
              style={[styles.cardDesc, { color: colors.textMuted }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}
        </View>
        {canManage && (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </View>
      <View style={[styles.cardMeta, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {item.total_staff} nhân sự
          </Text>
        </View>
        {item.head?.full_name ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="person-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              Trưởng: {item.head.full_name}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Phòng ban",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerRight: () =>
            canManage ? (
              <TouchableOpacity onPress={openCreate} style={styles.headerBtn}>
                <Ionicons name="add" size={26} color="#fff" />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading && departments.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons
              name="warning-outline"
              size={40}
              color={colors.textMuted}
            />
            <Text style={[styles.errorText, { color: colors.text }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.primary }]}
              onPress={refresh}
            >
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={departments}
            keyExtractor={(d) => String(d.id)}
            renderItem={renderDept}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="business-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Chưa có phòng ban nào
                </Text>
              </View>
            }
            onRefresh={refresh}
            refreshing={loading}
          />
        )}
      </View>

      {/* Create / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setModalVisible(false)}
        />
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingDept ? "Chỉnh sửa phòng ban" : "Tạo phòng ban mới"}
          </Text>

          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            Tên *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            value={formName}
            onChangeText={setFormName}
            placeholder="Tên phòng ban"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            Mô tả
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.inputMultiline,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            value={formDesc}
            onChangeText={setFormDesc}
            placeholder="Mô tả phòng ban"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, { borderColor: colors.border }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: colors.text }]}>
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                styles.modalBtnPrimary,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                  {editingDept ? "Cập nhật" : "Tạo mới"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 70,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalBtnPrimary: {
    borderWidth: 0,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
