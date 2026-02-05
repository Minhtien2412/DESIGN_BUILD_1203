/**
 * Contact Sync Settings Screen
 * Quản lý cài đặt đồng bộ danh bạ điện thoại (Zalo-style)
 */

import { Container } from "@/components/ui/container";
import { useThemeColor } from "@/hooks/use-theme-color";
import phoneContactSyncService, {
    SyncSettings,
} from "@/services/phoneContactSyncService";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ContactSyncSettingsScreen() {
  const [settings, setSettings] = useState<SyncSettings>(
    phoneContactSyncService.getSettings(),
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [friendsCount, setFriendsCount] = useState(
    phoneContactSyncService.getMatchedFriends().length,
  );

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBg = useThemeColor({}, "card");
  const backgroundColor = useThemeColor({}, "background");

  // Reload settings on mount
  useEffect(() => {
    setSettings(phoneContactSyncService.getSettings());
    setFriendsCount(phoneContactSyncService.getMatchedFriends().length);
  }, []);

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    const granted = await phoneContactSyncService.requestPermission();
    setSettings(phoneContactSyncService.getSettings());

    if (!granted) {
      phoneContactSyncService.showPermissionDeniedDialog();
    }
  }, []);

  // Handle sync contacts
  const handleSyncContacts = useCallback(async () => {
    if (!settings.hasPermission) {
      phoneContactSyncService.showSyncRequestDialog(
        async () => {
          setIsSyncing(true);
          try {
            const result = await phoneContactSyncService.syncContacts();
            setSettings(phoneContactSyncService.getSettings());
            setFriendsCount(result.friends.length);
            Alert.alert(
              "✅ Đồng bộ thành công",
              `Tìm thấy ${result.matchedCount} bạn bè đang dùng ứng dụng!`,
            );
          } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Đồng bộ thất bại");
          } finally {
            setIsSyncing(false);
          }
        },
        () => {},
      );
      return;
    }

    setIsSyncing(true);
    try {
      const result = await phoneContactSyncService.syncContacts();
      setSettings(phoneContactSyncService.getSettings());
      setFriendsCount(result.friends.length);

      if (result.success) {
        Alert.alert(
          "✅ Đồng bộ thành công",
          `Tìm thấy ${result.matchedCount} bạn bè đang dùng ứng dụng!`,
        );
      } else {
        Alert.alert("Lỗi", result.error || "Không thể đồng bộ danh bạ");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đồng bộ thất bại");
    } finally {
      setIsSyncing(false);
    }
  }, [settings.hasPermission]);

  // Handle toggle auto sync
  const handleToggleAutoSync = useCallback(async (enabled: boolean) => {
    await phoneContactSyncService.setAutoSync(enabled);
    setSettings(phoneContactSyncService.getSettings());
  }, []);

  // Handle clear sync data
  const handleClearSyncData = useCallback(() => {
    Alert.alert(
      "Xóa dữ liệu đồng bộ?",
      "Danh sách bạn bè đã tìm thấy sẽ bị xóa. Bạn có thể đồng bộ lại bất kỳ lúc nào.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            await phoneContactSyncService.clearSyncData();
            setSettings(phoneContactSyncService.getSettings());
            setFriendsCount(0);
            Alert.alert("Đã xóa", "Dữ liệu đồng bộ đã được xóa");
          },
        },
      ],
    );
  }, []);

  // Handle reset prompt
  const handleResetPrompt = useCallback(async () => {
    await phoneContactSyncService.resetSyncPrompt();
    Alert.alert(
      "Đã reset",
      "Thông báo đồng bộ sẽ hiển thị lại khi bạn vào màn hình Danh bạ",
    );
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Đồng bộ danh bạ",
          headerBackTitle: "Quay lại",
        }}
      />

      <ScrollView style={[styles.container, { backgroundColor }]}>
        <Container>
          {/* Info Card */}
          <View
            style={[styles.infoCard, { backgroundColor: tintColor + "10" }]}
          >
            <Ionicons name="information-circle" size={24} color={tintColor} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: textColor }]}>
                Tìm bạn bè trên ứng dụng
              </Text>
              <Text style={[styles.infoDesc, { color: textColor + "80" }]}>
                Đồng bộ danh bạ để tìm kiếm số điện thoại của bạn bè đang sử
                dụng ứng dụng. Số điện thoại được mã hóa SHA-256 trước khi gửi
                lên server để bảo vệ quyền riêng tư.
              </Text>
            </View>
          </View>

          {/* Permission Status */}
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Quyền truy cập
            </Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name={
                    settings.hasPermission ? "checkmark-circle" : "close-circle"
                  }
                  size={24}
                  color={settings.hasPermission ? "#22C55E" : "#EF4444"}
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Truy cập danh bạ
                  </Text>
                  <Text
                    style={[styles.settingDesc, { color: textColor + "60" }]}
                  >
                    {settings.hasPermission
                      ? "Đã được cấp quyền"
                      : "Chưa được cấp quyền"}
                  </Text>
                </View>
              </View>

              {!settings.hasPermission && (
                <TouchableOpacity
                  style={[styles.permissionBtn, { backgroundColor: tintColor }]}
                  onPress={handleRequestPermission}
                >
                  <Text style={styles.permissionBtnText}>Cấp quyền</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Sync Section */}
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Đồng bộ danh bạ
            </Text>

            {/* Sync Status */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="people" size={24} color={tintColor} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Bạn bè đã tìm thấy
                  </Text>
                  <Text
                    style={[styles.settingDesc, { color: textColor + "60" }]}
                  >
                    {friendsCount} người dùng ứng dụng
                  </Text>
                </View>
              </View>
              <Text style={[styles.countBadge, { color: tintColor }]}>
                {friendsCount}
              </Text>
            </View>

            {/* Last Sync */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="time" size={24} color={tintColor} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Lần đồng bộ cuối
                  </Text>
                  <Text
                    style={[styles.settingDesc, { color: textColor + "60" }]}
                  >
                    {settings.lastSyncAt
                      ? new Date(settings.lastSyncAt).toLocaleString("vi-VN")
                      : "Chưa đồng bộ"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Sync Now Button */}
            <TouchableOpacity
              style={[
                styles.syncButton,
                { backgroundColor: tintColor },
                isSyncing && styles.syncButtonDisabled,
              ]}
              onPress={handleSyncContacts}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.syncButtonText}>Đang đồng bộ...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sync" size={20} color="#fff" />
                  <Text style={styles.syncButtonText}>Đồng bộ ngay</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Auto Sync Settings */}
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Cài đặt tự động
            </Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="refresh-circle" size={24} color={tintColor} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Tự động đồng bộ
                  </Text>
                  <Text
                    style={[styles.settingDesc, { color: textColor + "60" }]}
                  >
                    Cập nhật danh sách bạn bè mỗi 24 giờ
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoSync}
                onValueChange={handleToggleAutoSync}
                trackColor={{ false: "#767577", true: tintColor + "50" }}
                thumbColor={settings.autoSync ? tintColor : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Privacy & Data */}
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Quyền riêng tư
            </Text>

            {/* Privacy Info */}
            <View style={styles.privacyInfo}>
              <View style={styles.privacyItem}>
                <Ionicons name="lock-closed" size={20} color="#22C55E" />
                <Text style={[styles.privacyText, { color: textColor + "80" }]}>
                  Số điện thoại được mã hóa SHA-256
                </Text>
              </View>
              <View style={styles.privacyItem}>
                <Ionicons name="cloud-offline" size={20} color="#22C55E" />
                <Text style={[styles.privacyText, { color: textColor + "80" }]}>
                  Không lưu trữ danh bạ trên server
                </Text>
              </View>
              <View style={styles.privacyItem}>
                <Ionicons name="trash-bin" size={20} color="#22C55E" />
                <Text style={[styles.privacyText, { color: textColor + "80" }]}>
                  Có thể xóa dữ liệu bất kỳ lúc nào
                </Text>
              </View>
            </View>

            {/* Clear Data Button */}
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: "#EF4444" }]}
              onPress={handleClearSyncData}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.clearButtonText}>Xóa dữ liệu đồng bộ</Text>
            </TouchableOpacity>

            {/* Reset Prompt Button */}
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: textColor + "30" }]}
              onPress={handleResetPrompt}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={textColor + "70"}
              />
              <Text
                style={[styles.resetButtonText, { color: textColor + "70" }]}
              >
                Hiển thị lại thông báo đồng bộ
              </Text>
            </TouchableOpacity>
          </View>

          {/* View Friends Button */}
          {friendsCount > 0 && (
            <TouchableOpacity
              style={[styles.viewFriendsBtn, { backgroundColor: cardBg }]}
              onPress={() => router.push("/(tabs)/contacts")}
            >
              <View style={styles.viewFriendsContent}>
                <Ionicons name="people-circle" size={28} color={tintColor} />
                <View style={styles.viewFriendsText}>
                  <Text style={[styles.viewFriendsTitle, { color: textColor }]}>
                    Xem danh sách bạn bè
                  </Text>
                  <Text
                    style={[
                      styles.viewFriendsDesc,
                      { color: textColor + "60" },
                    ]}
                  >
                    {friendsCount} bạn bè đang dùng ứng dụng
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={textColor + "40"}
              />
            </TouchableOpacity>
          )}
        </Container>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5E5",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  countBadge: {
    fontSize: 18,
    fontWeight: "700",
  },
  permissionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  permissionBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  privacyInfo: {
    gap: 12,
    marginBottom: 16,
  },
  privacyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  privacyText: {
    fontSize: 13,
    flex: 1,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  clearButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  viewFriendsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  viewFriendsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  viewFriendsText: {},
  viewFriendsTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  viewFriendsDesc: {
    fontSize: 13,
    marginTop: 2,
  },
});
