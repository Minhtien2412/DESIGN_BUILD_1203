import photoTimelineService, {
    PhotoCategory,
    PhotoPhase,
} from "@/services/api/photo-timeline.service";
import { ConstructionProgressService } from "@/services/featureServiceWrapper";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface Milestone {
  id: string;
  title: string;
  description: string;
  percentage: number;
  amount: number;
  status: "pending" | "in-progress" | "completed" | "paid";
  startDate?: string;
  endDate?: string;
  completionDate?: string;
  photos: string[];
}

interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  description: string;
}

interface Project {
  id: string;
  title: string;
  address: string;
  startDate: string;
  estimatedEndDate: string;
  totalAmount: number;
  paidAmount: number;
  workerName: string;
  workerPhone: string;
  workerAvatar: string;
}

// Mock data
const MOCK_PROJECT: Project = {
  id: "proj-001",
  title: "Xây Nhà 3 Tầng",
  address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  startDate: "2025-10-01",
  estimatedEndDate: "2025-12-31",
  totalAmount: 450000000,
  paidAmount: 135000000,
  workerName: "Nguyễn Văn A",
  workerPhone: "0901234567",
  workerAvatar: "https://i.pravatar.cc/150?img=12",
};

const MOCK_MILESTONES: Milestone[] = [
  {
    id: "m1",
    title: "Giai đoạn 1: Móng và Kết cấu",
    description: "Đào móng, đổ bê tông móng, cột tầng 1",
    percentage: 30,
    amount: 135000000,
    status: "paid",
    startDate: "2025-10-01",
    endDate: "2025-10-20",
    completionDate: "2025-10-18",
    photos: [
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300",
      "https://images.unsplash.com/photo-1590642916589-592bca10dfbf?w=300",
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300",
    ],
  },
  {
    id: "m2",
    title: "Giai đoạn 2: Tường và Mái",
    description: "Xây tường tầng 1-3, đổ sàn, lợp mái",
    percentage: 40,
    amount: 180000000,
    status: "in-progress",
    startDate: "2025-10-21",
    endDate: "2025-11-25",
    photos: [
      "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=300",
      "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=300",
    ],
  },
  {
    id: "m3",
    title: "Giai đoạn 3: Hoàn thiện",
    description: "Lắp điện nước, sơn, lát gạch, hoàn thiện",
    percentage: 30,
    amount: 135000000,
    status: "pending",
    startDate: "2025-11-26",
    endDate: "2025-12-31",
    photos: [],
  },
];

export default function ConstructionProgressScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const projectId = id || "1"; // Default to project 1 for testing

  const [project, setProject] = useState<Project>(MOCK_PROJECT);
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock");
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Load real data from API
  useEffect(() => {
    loadProgressData();
  }, [projectId]);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      const result = await ConstructionProgressService.getByProject(projectId);
      if (result.success && result.data) {
        const apiData = result.data;

        // Transform API data to Project format
        setProject({
          id: String(apiData.projectId),
          title: apiData.name || MOCK_PROJECT.title,
          address: apiData.description || MOCK_PROJECT.address,
          startDate:
            apiData.timeline?.startDate?.split("T")[0] ||
            MOCK_PROJECT.startDate,
          estimatedEndDate:
            apiData.timeline?.endDate?.split("T")[0] ||
            MOCK_PROJECT.estimatedEndDate,
          totalAmount: apiData.budget?.totalAmount || MOCK_PROJECT.totalAmount,
          paidAmount: apiData.budget?.paidAmount || MOCK_PROJECT.paidAmount,
          workerName:
            apiData.engineer?.name ||
            apiData.client?.name ||
            MOCK_PROJECT.workerName,
          workerPhone: MOCK_PROJECT.workerPhone,
          workerAvatar: MOCK_PROJECT.workerAvatar,
        });

        // Transform milestones if available
        if (apiData.milestones && Array.isArray(apiData.milestones)) {
          const transformedMilestones: Milestone[] = apiData.milestones.map(
            (m: any, idx: number) => ({
              id: `m${idx + 1}`,
              title: m.name || `Giai đoạn ${idx + 1}`,
              description: m.description || "",
              percentage: m.progress || 0,
              amount: 0,
              status: m.completed
                ? "completed"
                : m.progress > 0
                  ? "in-progress"
                  : "pending",
              photos: [],
            }),
          );
          if (transformedMilestones.length > 0) {
            setMilestones(transformedMilestones);
          }
        }

        setDataSource(result.source === "api" ? "api" : "mock");
        console.log("[Progress] Loaded from:", result.source);
      }
    } catch (error) {
      console.error("[Progress] Error:", error);
      setDataSource("mock");
    } finally {
      setLoading(false);
    }
  };

  const completedPercentage = (project.paidAmount / project.totalAmount) * 100;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const mapMilestoneToPhotoMeta = (
    milestone: Milestone,
  ): { category: PhotoCategory; phase: PhotoPhase } => {
    const title = milestone.title.toLowerCase();
    if (title.includes("móng") || title.includes("foundation"))
      return { category: "FOUNDATION", phase: "FOUNDATION" };
    if (title.includes("kết cấu") || title.includes("structure"))
      return { category: "STRUCTURE", phase: "STRUCTURE" };
    if (title.includes("mái") || title.includes("roof"))
      return { category: "ROOFING", phase: "ENCLOSURE" };
    if (title.includes("nội thất") || title.includes("interior"))
      return { category: "INTERIOR", phase: "INTERIOR" };
    if (title.includes("hoàn thiện") || title.includes("finishing"))
      return { category: "FINISHING", phase: "FINISHING" };
    return { category: "OVERALL", phase: "STRUCTURE" };
  };

  const handlePayment = (milestone: Milestone) => {
    if (milestone.status === "completed") {
      Alert.alert(
        "Xác nhận thanh toán",
        `Thanh toán ${milestone.amount.toLocaleString("vi-VN")}đ cho ${milestone.title}?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Thanh toán",
            onPress: () => {
              // Navigate to payment screen
              router.push("/checkout/payment" as Href);
            },
          },
        ],
      );
    } else {
      Alert.alert("Chưa thể thanh toán", "Giai đoạn này chưa hoàn thành");
    }
  };

  const handleUploadPhoto = async (milestone: Milestone) => {
    if (uploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert(
        "Thiếu quyền",
        "Vui lòng cấp quyền truy cập thư viện ảnh để tải lên.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const fileName = asset.fileName || `progress_${Date.now()}.jpg`;
    const mimeType = asset.mimeType || "image/jpeg";
    const projectIdNumber = Number(projectId);

    if (!projectIdNumber || Number.isNaN(projectIdNumber)) {
      Alert.alert("Lỗi", "Không xác định được dự án để tải ảnh.");
      return;
    }

    try {
      setUploading(true);
      const { category, phase } = mapMilestoneToPhotoMeta(milestone);
      const response = await photoTimelineService.uploadPhoto({
        projectId: projectIdNumber,
        category,
        phase,
        location: project.address || "Công trình",
        description: milestone.title,
        file: {
          uri: asset.uri,
          name: fileName,
          type: mimeType,
        } as any,
        capturedAt: new Date().toISOString(),
      });

      const uploaded = response.data ?? (response as any);
      const photoUrl = uploaded?.imageUrl || uploaded?.url || asset.uri;

      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestone.id ? { ...m, photos: [photoUrl, ...m.photos] } : m,
        ),
      );
      Alert.alert("Thành công", "Đã tải ảnh tiến độ.");
    } catch (error) {
      console.error("[Progress] Upload photo error:", error);
      Alert.alert("Lỗi", "Không thể tải ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleViewPhotos = (milestone: Milestone, index = 0) => {
    setGalleryPhotos(milestone.photos);
    setGalleryIndex(index);
    setGalleryVisible(true);
  };

  const handleCallWorker = () => {
    Alert.alert(
      "Gọi điện",
      `Gọi cho ${project.workerName}: ${project.workerPhone}`,
    );
  };

  const handleChatWorker = () => {
    router.push("/messages");
  };

  const renderHeader = () => (
    <View style={styles.fixedHeader}>
      <Animated.View
        style={[styles.headerBackground, { opacity: headerOpacity }]}
      />
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]}>
          Tiến Độ Thi Công
        </Animated.Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => Alert.alert("Lịch sử", "Xem lịch sử thanh toán")}
        >
          <Ionicons name="receipt-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProjectInfo = () => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleRow}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Đang thi công</Text>
          </View>
        </View>
        <View style={styles.projectMetaRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.projectAddress} numberOfLines={1}>
            {project.address}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Tiến độ thanh toán</Text>
          <Text style={styles.progressPercent}>
            {completedPercentage.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${completedPercentage}%` },
            ]}
          />
        </View>
        <View style={styles.progressAmounts}>
          <Text style={styles.paidAmount}>
            Đã thanh toán: {project.paidAmount.toLocaleString("vi-VN")}đ
          </Text>
          <Text style={styles.totalAmount}>
            Tổng: {project.totalAmount.toLocaleString("vi-VN")}đ
          </Text>
        </View>
      </View>

      {/* Worker Info */}
      <View style={styles.workerSection}>
        <View style={styles.workerInfo}>
          <Image
            source={{ uri: project.workerAvatar }}
            style={styles.workerAvatar}
          />
          <View style={styles.workerDetails}>
            <Text style={styles.workerName}>{project.workerName}</Text>
            <Text style={styles.workerRole}>Trưởng công trình</Text>
          </View>
        </View>
        <View style={styles.workerActions}>
          <TouchableOpacity
            style={styles.workerActionButton}
            onPress={handleCallWorker}
          >
            <Ionicons name="call" size={20} color="#00B14F" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.workerActionButton}
            onPress={handleChatWorker}
          >
            <Ionicons name="chatbubble" size={20} color="#00B14F" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMilestone = (milestone: Milestone, index: number) => {
    const isLast = index === milestones.length - 1;
    const statusConfig = {
      pending: {
        icon: "ellipse-outline",
        color: "#999",
        bg: "#f5f5f5",
        label: "Chưa bắt đầu",
      },
      "in-progress": {
        icon: "sync",
        color: "#0D9488",
        bg: "#F0FDFA",
        label: "Đang thực hiện",
      },
      completed: {
        icon: "checkmark-circle",
        color: "#0D9488",
        bg: "#E8F5E9",
        label: "Hoàn thành",
      },
      paid: {
        icon: "checkmark-circle",
        color: "#00B14F",
        bg: "#E8F5E9",
        label: "Đã thanh toán",
      },
    };

    const config = statusConfig[milestone.status];

    return (
      <View key={milestone.id} style={styles.milestoneContainer}>
        {/* Timeline indicator */}
        <View style={styles.timeline}>
          <View style={[styles.timelineDot, { backgroundColor: config.color }]}>
            <Ionicons name={config.icon as any} size={20} color="#fff" />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        {/* Milestone Card */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            <View
              style={[
                styles.milestoneStatusBadge,
                { backgroundColor: config.bg },
              ]}
            >
              <Text
                style={[styles.milestoneStatusText, { color: config.color }]}
              >
                {config.label}
              </Text>
            </View>
          </View>

          <Text style={styles.milestoneDescription}>
            {milestone.description}
          </Text>

          {/* Dates */}
          {milestone.startDate && (
            <View style={styles.milestoneMeta}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.milestoneMetaText}>
                {milestone.startDate} → {milestone.endDate}
              </Text>
            </View>
          )}

          {milestone.completionDate && (
            <View style={styles.milestoneCompletionDate}>
              <Ionicons name="checkmark-circle" size={14} color="#0D9488" />
              <Text style={styles.completionDateText}>
                Hoàn thành: {milestone.completionDate}
              </Text>
            </View>
          )}

          {/* Amount */}
          <View style={styles.milestoneAmount}>
            <View style={styles.amountRow}>
              <Text style={styles.percentageText}>{milestone.percentage}%</Text>
              <Text style={styles.amountText}>
                {milestone.amount.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>

          {/* Photos */}
          {milestone.photos.length > 0 && (
            <View style={styles.photosSection}>
              <Text style={styles.photosLabel}>
                Hình ảnh tiến độ ({milestone.photos.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosList}
              >
                {milestone.photos.map((photo, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleViewPhotos(milestone, idx)}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={styles.photoThumbnail}
                    />
                  </TouchableOpacity>
                ))}
                {milestone.status === "in-progress" && (
                  <TouchableOpacity
                    style={styles.uploadPhotoButton}
                    onPress={() => handleUploadPhoto(milestone)}
                  >
                    <Ionicons name="camera" size={24} color="#00B14F" />
                    <Text style={styles.uploadPhotoText}>Thêm ảnh</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

          {/* Actions */}
          <View style={styles.milestoneActions}>
            {milestone.status === "in-progress" &&
              milestone.photos.length === 0 && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleUploadPhoto(milestone)}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={18}
                    color="#00B14F"
                  />
                  <Text style={styles.uploadButtonText}>Tải ảnh tiến độ</Text>
                </TouchableOpacity>
              )}

            {milestone.status === "completed" && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePayment(milestone)}
              >
                <Ionicons name="card-outline" size={18} color="#fff" />
                <Text style={styles.payButtonText}>Thanh toán ngay</Text>
              </TouchableOpacity>
            )}

            {milestone.status === "paid" && (
              <View style={styles.paidIndicator}>
                <Ionicons name="checkmark-circle" size={18} color="#00B14F" />
                <Text style={styles.paidText}>Đã thanh toán</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}

      <Modal
        visible={galleryVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGalleryVisible(false)}
      >
        <View style={styles.galleryBackdrop}>
          <View style={styles.galleryHeader}>
            <TouchableOpacity
              onPress={() => setGalleryVisible(false)}
              style={styles.galleryClose}
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.galleryTitle}>
              Ảnh tiến độ {galleryIndex + 1}/{galleryPhotos.length}
            </Text>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: galleryIndex * width, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const nextIndex = Math.round(
                e.nativeEvent.contentOffset.x / width,
              );
              setGalleryIndex(nextIndex);
            }}
          >
            {galleryPhotos.map((photo, idx) => (
              <View key={`${photo}_${idx}`} style={styles.gallerySlide}>
                <Image source={{ uri: photo }} style={styles.galleryImage} />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {renderProjectInfo()}

          <View style={styles.milestonesSection}>
            <Text style={styles.sectionTitle}>Tiến độ thi công</Text>
            {milestones.map((milestone, index) =>
              renderMilestone(milestone, index),
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 88,
    paddingBottom: 32,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 44,
    height: 88,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 44,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  projectCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  projectTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0D9488",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0D9488",
  },
  projectMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  projectAddress: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  progressSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00B14F",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00B14F",
    borderRadius: 4,
  },
  progressAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paidAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00B14F",
  },
  totalAmount: {
    fontSize: 12,
    color: "#666",
  },
  workerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f0f0",
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  workerRole: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  workerActions: {
    flexDirection: "row",
    gap: 8,
  },
  workerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  milestonesSection: {
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  milestoneContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timeline: {
    width: 40,
    alignItems: "center",
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#e0e0e0",
    minHeight: 60,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  milestoneStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  milestoneStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  milestoneDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  milestoneMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  milestoneMetaText: {
    fontSize: 12,
    color: "#666",
  },
  milestoneCompletionDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  completionDateText: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "600",
  },
  milestoneAmount: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00B14F",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF3B30",
  },
  photosSection: {
    marginBottom: 12,
  },
  photosLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  photosList: {
    gap: 8,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  uploadPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#00B14F",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  uploadPhotoText: {
    fontSize: 10,
    color: "#00B14F",
    fontWeight: "600",
    marginTop: 4,
  },
  milestoneActions: {
    flexDirection: "row",
    gap: 8,
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00B14F",
  },
  payButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00B14F",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    shadowColor: "#00B14F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  paidIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  paidText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00B14F",
  },
  galleryBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
  },
  galleryHeader: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  galleryClose: {
    padding: 8,
    marginRight: 12,
  },
  galleryTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  gallerySlide: {
    width,
    height,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryImage: {
    width,
    height: height * 0.7,
    resizeMode: "contain",
  },
});
