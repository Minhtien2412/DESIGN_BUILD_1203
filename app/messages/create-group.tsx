/**
 * Create Group Screen
 * Multi-select contacts → name group → create → navigate to group chat
 */

import Avatar from "@/components/ui/avatar";
import { get, post } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#0D9488",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textTertiary: "#999999",
  border: "#E5E5E5",
  online: "#0D9488",
  danger: "#DC2626",
};

interface ContactUser {
  id: number;
  name: string;
  email: string;
  role?: string;
  avatar?: string | null;
}

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch contacts
  useEffect(() => {
    (async () => {
      try {
        const users = await get<ContactUser[]>("/api/users");
        setContacts(Array.isArray(users) ? users : []);
      } catch {
        console.warn("[CreateGroup] Failed to load contacts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleSelect = useCallback((id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedContacts = contacts.filter((c) => selectedIds.has(c.id));

  const handleCreate = useCallback(async () => {
    const name = groupName.trim();
    if (!name) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
      return;
    }
    if (selectedIds.size < 2) {
      Alert.alert("Lỗi", "Chọn ít nhất 2 thành viên");
      return;
    }

    setCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await post<{ id: string }>("/api/v1/conversations", {
        type: "GROUP",
        title: name,
        participantIds: Array.from(selectedIds),
      });

      Alert.alert("Thành công", `Nhóm "${name}" đã được tạo!`, [
        {
          text: "OK",
          onPress: () => {
            if (result?.id) {
              router.replace(`/chat/${result.id}` as any);
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch {
      Alert.alert("Lỗi", "Không thể tạo nhóm. Vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  }, [groupName, selectedIds]);

  const hasRealAvatar = (avatar?: string | null) =>
    !!avatar && !avatar.includes("pravatar.cc") && avatar.length > 0;

  const renderContact = ({ item }: { item: ContactUser }) => {
    const selected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.contactItem, selected && styles.contactItemSelected]}
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.7}
      >
        <Avatar
          avatar={hasRealAvatar(item.avatar) ? item.avatar : undefined}
          name={item.name}
          pixelSize={44}
        />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactEmail}>{item.role || item.email}</Text>
        </View>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhóm mới</Text>
        <TouchableOpacity
          style={[
            styles.createBtn,
            (selectedIds.size < 2 || !groupName.trim()) &&
              styles.createBtnDisabled,
          ]}
          onPress={handleCreate}
          disabled={creating || selectedIds.size < 2 || !groupName.trim()}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.createBtnText}>Tạo</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Group Name Input */}
      <View style={styles.nameSection}>
        <View style={styles.groupIconPlaceholder}>
          <Ionicons name="people" size={28} color={COLORS.primary} />
        </View>
        <TextInput
          style={styles.nameInput}
          placeholder="Tên nhóm..."
          placeholderTextColor={COLORS.textTertiary}
          value={groupName}
          onChangeText={setGroupName}
          maxLength={60}
        />
      </View>

      {/* Selected chips */}
      {selectedContacts.length > 0 && (
        <View style={styles.selectedSection}>
          <FlatList
            data={selectedContacts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.chipsContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chip}
                onPress={() => toggleSelect(item.id)}
              >
                <Text style={styles.chipText} numberOfLines={1}>
                  {item.name}
                </Text>
                <Ionicons name="close" size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          />
          <Text style={styles.selectedCount}>
            Đã chọn {selectedIds.size} người
          </Text>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm liên hệ..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Contacts */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải liên hệ...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContact}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={48}
                color={COLORS.textTertiary}
              />
              <Text style={styles.emptyText}>Không tìm thấy liên hệ</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 4,
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },

  nameSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  groupIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },

  selectedSection: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chipsContainer: { paddingHorizontal: 16 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.text,
    marginRight: 4,
    maxWidth: 80,
  },
  selectedCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    marginTop: 6,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
  },

  listContent: { paddingBottom: 32 },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  contactItemSelected: {
    backgroundColor: `${COLORS.primary}08`,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  contactEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
