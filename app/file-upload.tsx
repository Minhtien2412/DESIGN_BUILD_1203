/**
 * File Upload Screen - Modern Minimalist Design
 * Upload avatar, documents, ảnh công trường với GPS
 * Features: Drag & Drop feel, Progress animations, Recent files
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// File types configuration
const FILE_TYPES = {
  image: {
    icon: "image-outline",
    color: "#10B981",
    label: "Ảnh",
    extensions: ["jpg", "jpeg", "png", "webp", "gif"],
  },
  document: {
    icon: "document-text-outline",
    color: "#3B82F6",
    label: "Tài liệu",
    extensions: ["pdf", "doc", "docx", "xls", "xlsx"],
  },
  video: {
    icon: "videocam-outline",
    color: "#8B5CF6",
    label: "Video",
    extensions: ["mp4", "mov", "avi"],
  },
  cad: {
    icon: "cube-outline",
    color: "#F59E0B",
    label: "CAD",
    extensions: ["dwg", "dxf", "skp"],
  },
};

// Recent files mock data
const RECENT_FILES = [
  {
    id: 1,
    name: "site_photo_01.jpg",
    type: "image",
    size: "2.4 MB",
    date: "2 giờ trước",
  },
  {
    id: 2,
    name: "contract_v2.pdf",
    type: "document",
    size: "1.8 MB",
    date: "1 ngày trước",
  },
  {
    id: 3,
    name: "progress_video.mp4",
    type: "video",
    size: "45 MB",
    date: "3 ngày trước",
  },
  {
    id: 4,
    name: "floor_plan.dwg",
    type: "cad",
    size: "8.2 MB",
    date: "1 tuần trước",
  },
];

interface UploadingFile {
  id: string;
  name: string;
  type: keyof typeof FILE_TYPES;
  progress: number;
  status: "uploading" | "completed" | "error";
}

export default function FileUploadScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const borderColor = isDark ? "#374151" : "#E5E7EB";
  const mutedText = isDark ? "#9CA3AF" : "#6B7280";

  // Animation refs
  const dropZoneScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardsStagger = useRef(
    RECENT_FILES.map(() => new Animated.Value(0))
  ).current;
  const uploadProgressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // State
  const [uploading, setUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [selectedType, setSelectedType] = useState<
    keyof typeof FILE_TYPES | null
  >(null);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.stagger(
        100,
        cardsStagger.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();

    // Pulse animation for drop zone
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Handle drop zone press animation
  const handleDropZonePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(dropZoneScale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(dropZoneScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Simulate upload progress
  const simulateUpload = useCallback((file: UploadingFile) => {
    const interval = setInterval(() => {
      setUploadingFiles((prev) =>
        prev.map((f) => {
          if (f.id === file.id && f.progress < 100) {
            const newProgress = Math.min(f.progress + Math.random() * 15, 100);
            return {
              ...f,
              progress: newProgress,
              status: newProgress >= 100 ? "completed" : "uploading",
            };
          }
          return f;
        })
      );
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, progress: 100, status: "completed" } : f
        )
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  }, []);

  // Pick image from gallery or camera
  const handlePickImage = async (useCamera: boolean = false) => {
    handleDropZonePress();

    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Quyền truy cập",
          "Vui lòng cấp quyền truy cập để tiếp tục"
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: 10,
          });

      if (!result.canceled && result.assets.length > 0) {
        const newFiles: UploadingFile[] = result.assets.map(
          (asset: ImagePicker.ImagePickerAsset, idx: number) => ({
            id: `${Date.now()}-${idx}`,
            name: asset.fileName || `image_${Date.now()}.jpg`,
            type: "image" as const,
            progress: 0,
            status: "uploading" as const,
          })
        );

        setUploadingFiles((prev) => [...prev, ...newFiles]);
        newFiles.forEach(simulateUpload);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  // Pick document
  const handlePickDocument = async () => {
    handleDropZonePress();

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.*",
        ],
        multiple: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newFiles: UploadingFile[] = result.assets.map(
          (
            asset: {
              name: string;
              uri: string;
              size?: number;
              mimeType?: string;
            },
            idx: number
          ) => ({
            id: `${Date.now()}-${idx}`,
            name: asset.name,
            type: "document" as const,
            progress: 0,
            status: "uploading" as const,
          })
        );

        setUploadingFiles((prev) => [...prev, ...newFiles]);
        newFiles.forEach(simulateUpload);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn tài liệu. Vui lòng thử lại.");
    }
  };

  // Quick action buttons
  const QuickActionButton = ({
    icon,
    label,
    color,
    onPress,
  }: {
    icon: string;
    label: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.quickAction,
        { backgroundColor: `${color}15`, borderColor: `${color}30` },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={22} color="#FFFFFF" />
      </View>
      <Text style={[styles.quickActionLabel, { color: textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // File type filter chip
  const FilterChip = ({
    type,
    config,
  }: {
    type: string;
    config: typeof FILE_TYPES.image;
  }) => {
    const isSelected = selectedType === type;
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          {
            backgroundColor: isSelected ? config.color : `${config.color}15`,
            borderColor: config.color,
          },
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          setSelectedType(isSelected ? null : (type as any));
        }}
      >
        <Ionicons
          name={config.icon as any}
          size={16}
          color={isSelected ? "#FFF" : config.color}
        />
        <Text
          style={[
            styles.filterChipText,
            { color: isSelected ? "#FFF" : config.color },
          ]}
        >
          {config.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Recent file item
  const RecentFileItem = ({
    file,
    index,
  }: {
    file: (typeof RECENT_FILES)[0];
    index: number;
  }) => {
    const config = FILE_TYPES[file.type as keyof typeof FILE_TYPES];
    return (
      <Animated.View
        style={[
          styles.recentFile,
          {
            backgroundColor: cardBg,
            borderColor,
            opacity: cardsStagger[index],
            transform: [
              {
                translateY: cardsStagger[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[styles.fileIcon, { backgroundColor: `${config.color}15` }]}
        >
          <Ionicons name={config.icon as any} size={24} color={config.color} />
        </View>
        <View style={styles.fileInfo}>
          <Text
            style={[styles.fileName, { color: textColor }]}
            numberOfLines={1}
          >
            {file.name}
          </Text>
          <Text style={[styles.fileMeta, { color: mutedText }]}>
            {file.size} • {file.date}
          </Text>
        </View>
        <TouchableOpacity style={styles.fileAction}>
          <Ionicons name="ellipsis-vertical" size={20} color={mutedText} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Uploading file item
  const UploadingFileItem = ({ file }: { file: UploadingFile }) => {
    const config = FILE_TYPES[file.type];
    return (
      <View
        style={[styles.uploadingFile, { backgroundColor: cardBg, borderColor }]}
      >
        <View
          style={[styles.fileIcon, { backgroundColor: `${config.color}15` }]}
        >
          {file.status === "uploading" ? (
            <ActivityIndicator size="small" color={config.color} />
          ) : (
            <Ionicons
              name={
                file.status === "completed"
                  ? "checkmark-circle"
                  : "close-circle"
              }
              size={24}
              color={file.status === "completed" ? "#10B981" : "#EF4444"}
            />
          )}
        </View>
        <View style={styles.fileInfo}>
          <Text
            style={[styles.fileName, { color: textColor }]}
            numberOfLines={1}
          >
            {file.name}
          </Text>
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressTrack, { backgroundColor: borderColor }]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor:
                      file.status === "error" ? "#EF4444" : config.color,
                    width: `${file.progress}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: mutedText }]}>
              {file.status === "completed"
                ? "Hoàn tất"
                : `${Math.round(file.progress)}%`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header with blur */}
      <Animated.View
        style={[styles.headerContainer, { opacity: headerOpacity }]}
      >
        <LinearGradient
          colors={isDark ? ["#1E3A5F", "#0F172A"] : ["#3B82F6", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Quản lý File</Text>
              <Text style={styles.headerSubtitle}>
                Upload & quản lý tài liệu dự án
              </Text>
            </View>

            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Storage info */}
          <View style={styles.storageInfo}>
            <View style={styles.storageBar}>
              <View style={[styles.storageUsed, { width: "35%" }]} />
            </View>
            <Text style={styles.storageText}>3.5 GB / 10 GB đã sử dụng</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Drop Zone */}
        <Animated.View
          style={[
            styles.dropZone,
            {
              backgroundColor: isDark ? "#1F2937" : "#F8FAFC",
              borderColor: isDark ? "#374151" : "#E2E8F0",
              transform: [
                { scale: Animated.multiply(dropZoneScale, pulseAnim) },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.dropZoneInner}
            onPress={() => handlePickImage(false)}
            activeOpacity={0.8}
          >
            <View style={styles.dropZoneIconContainer}>
              <LinearGradient
                colors={["#3B82F6", "#8B5CF6"]}
                style={styles.dropZoneIconBg}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={40}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            <Text style={[styles.dropZoneTitle, { color: textColor }]}>
              Kéo thả hoặc chọn file
            </Text>
            <Text style={[styles.dropZoneSubtitle, { color: mutedText }]}>
              Hỗ trợ ảnh, PDF, DOC, Excel, CAD (tối đa 50MB)
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="camera"
            label="Chụp ảnh"
            color="#10B981"
            onPress={() => handlePickImage(true)}
          />
          <QuickActionButton
            icon="images"
            label="Thư viện"
            color="#3B82F6"
            onPress={() => handlePickImage(false)}
          />
          <QuickActionButton
            icon="document"
            label="Tài liệu"
            color="#F59E0B"
            onPress={handlePickDocument}
          />
          <QuickActionButton
            icon="folder"
            label="Thư mục"
            color="#8B5CF6"
            onPress={() => Alert.alert("Thư mục", "Tính năng đang phát triển")}
          />
        </View>

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Đang tải lên
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setUploadingFiles((prev) =>
                    prev.filter((f) => f.status === "uploading")
                  )
                }
              >
                <Text style={styles.clearText}>Xóa hoàn tất</Text>
              </TouchableOpacity>
            </View>
            {uploadingFiles.map((file) => (
              <UploadingFileItem key={file.id} file={file} />
            ))}
          </View>
        )}

        {/* Filter chips */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(FILE_TYPES).map(([type, config]) => (
              <FilterChip key={type} type={type} config={config} />
            ))}
          </ScrollView>
        </View>

        {/* Recent Files */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Gần đây
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {RECENT_FILES.filter(
            (f) => !selectedType || f.type === selectedType
          ).map((file, index) => (
            <RecentFileItem key={file.id} file={file} index={index} />
          ))}
        </View>

        {/* Features Grid */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: textColor, marginBottom: 16 },
            ]}
          >
            Tính năng nổi bật
          </Text>
          <View style={styles.featuresGrid}>
            {[
              { icon: "resize", label: "Tự động resize", color: "#10B981" },
              { icon: "location", label: "GPS metadata", color: "#3B82F6" },
              { icon: "cloud-done", label: "Lưu trữ S3", color: "#8B5CF6" },
              {
                icon: "shield-checkmark",
                label: "Mã hóa AES",
                color: "#F59E0B",
              },
            ].map((feature, idx) => (
              <View
                key={idx}
                style={[
                  styles.featureCard,
                  { backgroundColor: `${feature.color}10` },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color={feature.color}
                />
                <Text style={[styles.featureLabel, { color: textColor }]}>
                  {feature.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  storageInfo: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  storageBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  storageUsed: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  storageText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
    textAlign: "right",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  dropZone: {
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: 24,
    overflow: "hidden",
  },
  dropZoneInner: {
    paddingVertical: 40,
    alignItems: "center",
  },
  dropZoneIconContainer: {
    marginBottom: 16,
  },
  dropZoneIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dropZoneTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  dropZoneSubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  quickAction: {
    width: (SCREEN_WIDTH - 60) / 4,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  clearText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  recentFile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  uploadingFile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 13,
  },
  fileAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    width: 50,
    textAlign: "right",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  featureCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    margin: 6,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
  },
});
