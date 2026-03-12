/**
 * Cloud Backup Settings Screen
 * Backup and restore user data
 * @created 04/02/2026
 */

import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import cloudBackupService, {
    BackupMetadata,
    getLastBackupTimestamp
} from "@/services/cloudBackupService";
import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CloudBackupScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "textMuted");
  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");
  const successColor = useThemeColor({}, "success");
  const dangerColor = useThemeColor({}, "danger");

  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    const timestamp = await getLastBackupTimestamp();
    setLastBackup(timestamp);

    if (user?.id) {
      const list = await cloudBackupService.getBackupList(user.id);
      setBackups(list);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Create backup
  const handleCreateBackup = useCallback(async () => {
    if (!user?.id) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    Alert.alert("Sao lưu dữ liệu", "Bạn có muốn sao lưu dữ liệu lên đám mây?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Sao lưu",
        onPress: async () => {
          setIsLoading(true);
          try {
            const deviceId = Device.osInternalBuildId || "unknown";
            const deviceName =
              Device.deviceName || Device.modelName || "Unknown Device";

            const result = await cloudBackupService.createCloudBackup(
              user.id,
              deviceId,
              deviceName,
            );

            if (result.success) {
              Alert.alert("Thành công", "Đã sao lưu dữ liệu thành công!");
              await loadData();
            } else {
              // Try local backup as fallback
              await cloudBackupService.createLocalBackup();
              Alert.alert(
                "Sao lưu cục bộ",
                "Không thể kết nối đám mây. Đã lưu bản sao lưu cục bộ.",
              );
            }
          } catch (error) {
            console.error("Backup error:", error);
            Alert.alert("Lỗi", "Không thể sao lưu dữ liệu");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }, [user?.id, loadData]);

  // Restore backup
  const handleRestore = useCallback(
    async (backupId?: string) => {
      if (!user?.id) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để sử dụng tính năng này");
        return;
      }

      Alert.alert(
        "Khôi phục dữ liệu",
        "Dữ liệu hiện tại sẽ được thay thế bằng bản sao lưu. Bạn có chắc chắn?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Khôi phục",
            style: "destructive",
            onPress: async () => {
              setIsRestoring(true);
              try {
                const result = await cloudBackupService.restoreFromCloud(
                  user.id,
                  backupId,
                );

                if (result.success) {
                  Alert.alert(
                    "Thành công",
                    `Đã khôi phục ${result.restoredItems?.length || 0} mục dữ liệu!`,
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          // Might need to reload app
                        },
                      },
                    ],
                  );
                } else {
                  Alert.alert(
                    "Lỗi",
                    result.error || "Không thể khôi phục dữ liệu",
                  );
                }
              } catch (error) {
                console.error("Restore error:", error);
                Alert.alert("Lỗi", "Không thể khôi phục dữ liệu");
              } finally {
                setIsRestoring(false);
              }
            },
          },
        ],
      );
    },
    [user?.id],
  );

  // Delete backup
  const handleDeleteBackup = useCallback(
    (backupId: string) => {
      Alert.alert("Xóa bản sao lưu", "Bạn có chắc muốn xóa bản sao lưu này?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const success = await cloudBackupService.deleteBackup(backupId);
            if (success) {
              await loadData();
            } else {
              Alert.alert("Lỗi", "Không thể xóa bản sao lưu");
            }
          },
        },
      ]);
    },
    [loadData],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: t("settings.cloudBackup"),
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <View style={styles.statusHeader}>
            <Ionicons name="cloud-outline" size={40} color={primaryColor} />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: textColor }]}>
                Sao lưu đám mây
              </Text>
              <Text style={[styles.statusSubtitle, { color: mutedColor }]}>
                {lastBackup
                  ? `Lần cuối: ${formatDate(lastBackup)}`
                  : "Chưa có bản sao lưu"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={handleCreateBackup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Sao lưu ngay</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: successColor }]}
              onPress={() => handleRestore()}
              disabled={isRestoring || !lastBackup}
              activeOpacity={0.8}
            >
              {isRestoring ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-download" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Khôi phục</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View
          style={[styles.infoSection, { backgroundColor: primaryColor + "15" }]}
        >
          <Ionicons name="information-circle" size={20} color={primaryColor} />
          <Text style={[styles.infoText, { color: primaryColor }]}>
            Dữ liệu được sao lưu: Cài đặt, Yêu thích, Lịch sử xem, Giỏ hàng, Tùy
            chọn cá nhân
          </Text>
        </View>

        {/* Backup History */}
        {backups.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Lịch sử sao lưu
            </Text>

            {backups.map((backup) => (
              <View
                key={backup.id}
                style={[
                  styles.backupItem,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <View style={styles.backupInfo}>
                  <Text style={[styles.backupDate, { color: textColor }]}>
                    {formatDate(backup.createdAt)}
                  </Text>
                  <Text style={[styles.backupMeta, { color: mutedColor }]}>
                    {backup.deviceName} • {formatSize(backup.size)}
                  </Text>
                </View>

                <View style={styles.backupActions}>
                  <TouchableOpacity
                    style={[
                      styles.backupActionBtn,
                      { backgroundColor: successColor + "20" },
                    ]}
                    onPress={() => handleRestore(backup.id)}
                  >
                    <Ionicons
                      name="download-outline"
                      size={18}
                      color={successColor}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.backupActionBtn,
                      { backgroundColor: dangerColor + "20" },
                    ]}
                    onPress={() => handleDeleteBackup(backup.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={dangerColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Settings */}
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: textColor, marginBottom: Spacing[3] },
            ]}
          >
            Cài đặt sao lưu
          </Text>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: textColor }]}>
                Tự động sao lưu
              </Text>
              <Text style={[styles.settingDesc, { color: mutedColor }]}>
                Sao lưu mỗi 24 giờ khi có Wi-Fi
              </Text>
            </View>
            <Ionicons name="toggle" size={40} color={primaryColor} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: textColor }]}>
                Chỉ Wi-Fi
              </Text>
              <Text style={[styles.settingDesc, { color: mutedColor }]}>
                Chỉ sao lưu khi kết nối Wi-Fi
              </Text>
            </View>
            <Ionicons name="toggle" size={40} color={primaryColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing[4],
  },
  statusCard: {
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing[4],
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing[4],
  },
  statusInfo: {
    marginLeft: Spacing[3],
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing[3],
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    gap: Spacing[2],
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    marginBottom: Spacing[4],
    gap: Spacing[2],
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  historySection: {
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing[3],
  },
  backupItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing[2],
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  backupMeta: {
    fontSize: 12,
  },
  backupActions: {
    flexDirection: "row",
    gap: Spacing[2],
  },
  backupActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsCard: {
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing[2],
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing[3],
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: Spacing[2],
  },
});
