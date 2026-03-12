/**
 * Add Contact Screen
 * Search by phone/email → show user profile → start conversation
 */

import Avatar from "@/components/ui/avatar";
import {
    isPhoneNumber,
    searchUsers,
    type UserSearchResult,
} from "@/services/userSearchService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
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
};

export default function AddContactScreen() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<UserSearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      Alert.alert("Thông báo", "Nhập số điện thoại hoặc email để tìm");
      return;
    }

    Keyboard.dismiss();
    setSearching(true);
    setResult(null);
    setNotFound(false);

    try {
      const response = await searchUsers(q, { limit: 1 });
      if (response.users.length > 0) {
        setResult(response.users[0]);
      } else {
        setNotFound(true);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể tìm kiếm. Kiểm tra kết nối mạng.");
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleStartChat = useCallback((user: UserSearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/messages/${user.id}`);
  }, []);

  const hasRealAvatar = (avatar?: string) =>
    !!avatar && !avatar.includes("pravatar.cc") && avatar.length > 0;

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
        <Text style={styles.headerTitle}>Thêm liên hệ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <Text style={styles.label}>Tìm bằng số điện thoại hoặc email</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons
              name={isPhoneNumber(query) ? "call" : "mail"}
              size={20}
              color={COLORS.textTertiary}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="VD: 0901234567 hoặc name@email.com"
              placeholderTextColor={COLORS.textTertiary}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setNotFound(false);
                setResult(null);
              }}
              autoFocus
              keyboardType={
                isPhoneNumber(query) ? "phone-pad" : "email-address"
              }
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, searching && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="search" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Result */}
      {result && (
        <View style={styles.resultCard}>
          <Avatar
            avatar={hasRealAvatar(result.avatar) ? result.avatar : undefined}
            name={result.name}
            pixelSize={64}
          />
          <Text style={styles.resultName}>{result.name}</Text>
          {result.role && <Text style={styles.resultRole}>{result.role}</Text>}
          <Text style={styles.resultEmail}>{result.email}</Text>
          {result.phone && (
            <Text style={styles.resultPhone}>📱 {result.phone}</Text>
          )}

          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => handleStartChat(result)}
          >
            <Ionicons name="chatbubble" size={18} color="#FFFFFF" />
            <Text style={styles.chatBtnText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Not Found */}
      {notFound && (
        <View style={styles.notFoundCard}>
          <Ionicons
            name="person-outline"
            size={48}
            color={COLORS.textTertiary}
          />
          <Text style={styles.notFoundTitle}>Không tìm thấy người dùng</Text>
          <Text style={styles.notFoundSubtext}>
            Kiểm tra lại số điện thoại hoặc email và thử lại
          </Text>
        </View>
      )}

      {/* Hint */}
      {!result && !notFound && !searching && (
        <View style={styles.hintSection}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.textTertiary}
          />
          <Text style={styles.hintText}>
            Nhập số điện thoại hoặc email của người bạn muốn liên hệ
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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

  searchSection: { padding: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnDisabled: { opacity: 0.6 },

  resultCard: {
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  resultName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
  },
  resultRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  resultEmail: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  resultPhone: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  chatBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },

  notFoundCard: {
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 32,
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 12,
  },
  notFoundSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },

  hintSection: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
});
