/**
 * Teams Management Screen — Quản lý team
 * New permission system from constants/staffPermissions
 */

import { canManageTeams, canViewTeams } from "@/constants/staffPermissions";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
import { createTeam, updateTeam } from "@/services/staffService";
import { CompanyRole, type Team } from "@/types/staff";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function TeamsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();

  const userRole = useMemo<CompanyRole>(() => {
    const r = user?.role as CompanyRole | undefined;
    if (r && Object.values(CompanyRole).includes(r)) return r;
    if (user?.admin) return CompanyRole.ADMIN;
    return CompanyRole.STAFF;
  }, [user]);

  const canView = canViewTeams(userRole) || !!user?.admin;
  const canManage = canManageTeams(userRole) || !!user?.admin;

  const { departments } = useDepartments(true);
  const [filterDeptId, setFilterDeptId] = useState<number | undefined>(
    undefined,
  );
  const { teams, loading, error, refresh } = useTeams(filterDeptId, true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDeptId, setFormDeptId] = useState<number | null>(null);
  const [deptPickerVisible, setDeptPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const openCreate = useCallback(() => {
    setEditingTeam(null);
    setFormName("");
    setFormDesc("");
    setFormDeptId(departments.length > 0 ? departments[0].id : null);
    setModalVisible(true);
  }, [departments]);

  const openEdit = useCallback((team: Team) => {
    setEditingTeam(team);
    setFormName(team.name);
    setFormDesc(team.description ?? "");
    setFormDeptId(team.department_id);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên team");
      return;
    }
    if (!editingTeam && !formDeptId) {
      Alert.alert("Lỗi", "Vui lòng chọn phòng ban");
      return;
    }
    setSaving(true);
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, {
          name: formName.trim(),
          description: formDesc.trim() || undefined,
        });
        Alert.alert("Thành công", "Team đã được cập nhật");
      } else {
        await createTeam({
          name: formName.trim(),
          description: formDesc.trim() || undefined,
          department_id: formDeptId!,
        });
        Alert.alert("Thành công", "Team đã được tạo");
      }
      setModalVisible(false);
      refresh();
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message ?? "Không thể lưu team");
    } finally {
      setSaving(false);
    }
  }, [editingTeam, formName, formDesc, formDeptId, refresh]);

  // Guard
  if (!canView) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Quản lý Team" }} />
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.textMuted}
        />
        <Text style={[styles.guardText, { color: colors.text }]}>
          Không có quyền xem teams
        </Text>
      </View>
    );
  }

  const selectedDeptName =
    departments.find((d) => d.id === formDeptId)?.name ?? "Chọn phòng ban";
  const filterDeptName =
    departments.find((d) => d.id === filterDeptId)?.name ?? "Tất cả";

  const renderTeam = ({ item }: { item: Team }) => (
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
          <Ionicons name="people-outline" size={22} color={colors.primary} />
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
        {item.department?.name ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="business-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {item.department.name}
            </Text>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {item.total_members} thành viên
          </Text>
        </View>
        {item.leader?.full_name ? (
          <View style={styles.metaItem}>
            <Ionicons
              name="person-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              TL: {item.leader.full_name}
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
          title: "Quản lý Team",
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
        {/* Department filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipBar}
          style={[styles.chipBarWrap, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              !filterDeptId && styles.chipActive,
              {
                backgroundColor: !filterDeptId
                  ? colors.primary
                  : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setFilterDeptId(undefined)}
          >
            <Text
              style={[
                styles.chipText,
                { color: !filterDeptId ? "#fff" : colors.text },
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          {departments.map((d) => {
            const active = filterDeptId === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFilterDeptId(d.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? "#fff" : colors.text },
                  ]}
                >
                  {d.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading && teams.length === 0 ? (
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
            data={teams}
            keyExtractor={(t) => String(t.id)}
            renderItem={renderTeam}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Chưa có team nào
                </Text>
              </View>
            }
            onRefresh={refresh}
            refreshing={loading}
          />
        )}
      </View>

      {/* Create / Edit Team Modal */}
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
            {editingTeam ? "Chỉnh sửa team" : "Tạo team mới"}
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
            placeholder="Tên team"
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
            placeholder="Mô tả team"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Department picker (only for create) */}
          {!editingTeam && (
            <>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                Phòng ban *
              </Text>
              <TouchableOpacity
                style={[
                  styles.pickerBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={() => setDeptPickerVisible(true)}
              >
                <Text style={[styles.pickerBtnText, { color: colors.text }]}>
                  {selectedDeptName}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </>
          )}

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
                  {editingTeam ? "Cập nhật" : "Tạo mới"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Department picker submodal */}
      <Modal
        visible={deptPickerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDeptPickerVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setDeptPickerVisible(false)}
        />
        <View style={[styles.pickerModal, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Chọn phòng ban
          </Text>
          <ScrollView style={styles.pickerList}>
            {departments.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.pickerRow,
                  formDeptId === d.id && {
                    backgroundColor: colors.primary + "15",
                  },
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setFormDeptId(d.id);
                  setDeptPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerRowText,
                    {
                      color: formDeptId === d.id ? colors.primary : colors.text,
                    },
                  ]}
                >
                  {d.name}
                </Text>
                {formDeptId === d.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  chipBarWrap: {
    borderBottomWidth: 1,
    maxHeight: 52,
  },
  chipBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipActive: {
    borderWidth: 0,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
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
    flexWrap: "wrap",
    gap: 12,
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
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerBtnText: {
    fontSize: 15,
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
  pickerModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  pickerRowText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
