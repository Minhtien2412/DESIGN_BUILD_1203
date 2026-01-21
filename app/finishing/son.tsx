import {
    MODERN_COLORS,
    MODERN_FONT_SIZE,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================
// TYPES
// ============================================
type Worker = {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  experience: number;
  price: string;
  priceUnit: string;
  specialties: string[];
  teamSize: number;
  completedProjects: number;
  avatar: string;
  featured?: boolean;
  availability?: "available" | "busy" | "booked";
  pricePerDay?: string;
};

const WORKERS: Worker[] = [
  {
    id: 1,
    name: "Đội Sơn Chuyên Nghiệp",
    rating: 4.9,
    reviews: 245,
    location: "TP.HCM",
    experience: 17,
    price: "60.000₫",
    priceUnit: "/ m²",
    specialties: ["Sơn tường", "Sơn nước", "Sơn trang trí", "Chống thấm"],
    teamSize: 4,
    completedProjects: 456,
    avatar: "👨‍🎨",
    featured: true,
    availability: "available",
    pricePerDay: "500.000₫/ngày",
  },
  {
    id: 2,
    name: "Thợ Sơn Minh Tuấn",
    rating: 4.8,
    reviews: 218,
    location: "Hà Nội",
    experience: 15,
    price: "55.000₫",
    priceUnit: "/ m²",
    specialties: ["Sơn tường", "Sơn dầu", "Sơn phủ", "Sơn ngoại thất"],
    teamSize: 3,
    completedProjects: 389,
    avatar: "🎨",
    featured: true,
    availability: "available",
    pricePerDay: "480.000₫/ngày",
  },
  {
    id: 3,
    name: "Sơn Trang Trí Đà Nẵng",
    rating: 4.7,
    reviews: 187,
    location: "Đà Nẵng",
    experience: 13,
    price: "50.000₫",
    priceUnit: "/ m²",
    specialties: ["Sơn trang trí", "Sơn hiệu ứng", "Sơn 3D", "Vẽ tranh tường"],
    teamSize: 3,
    completedProjects: 312,
    avatar: "🖌️",
    availability: "available",
    pricePerDay: "450.000₫/ngày",
  },
  {
    id: 4,
    name: "Thợ Sơn Phương Nam",
    rating: 4.6,
    reviews: 156,
    location: "Cần Thơ",
    experience: 11,
    price: "45.000₫",
    priceUnit: "/ m²",
    specialties: ["Sơn tường", "Sơn nước", "Sơn công nghiệp", "Chống thấm"],
    teamSize: 2,
    completedProjects: 267,
    avatar: "👨‍🎨",
    availability: "busy",
    pricePerDay: "400.000₫/ngày",
  },
];

const LOCATIONS = ["Tất cả", "TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Khác"];
const PAINT_TYPES = [
  "Tất cả",
  "Sơn tường",
  "Sơn nước",
  "Sơn dầu",
  "Sơn trang trí",
  "Chống thấm",
];

// ============================================
// MODERN WORKER CARD COMPONENT
// ============================================
interface WorkerCardProps {
  worker: Worker;
  onBooking: () => void;
}

const ModernWorkerCard: React.FC<WorkerCardProps> = ({ worker, onBooking }) => {
  return (
    <Pressable style={styles.workerCard}>
      {/* Featured Badge */}
      {worker.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={10} color="#fff" />
          <Text style={styles.featuredText}>Đề xuất</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{worker.avatar}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.workerName} numberOfLines={1}>
            {worker.name}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={MODERN_COLORS.warning} />
            <Text style={styles.ratingText}>{worker.rating}</Text>
            <Text style={styles.reviewCount}>({worker.reviews})</Text>
          </View>

          {/* Location & Experience */}
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={11}
              color={MODERN_COLORS.textLight}
            />
            <Text style={styles.metaText}>{worker.location}</Text>
            <View style={styles.metaDot} />
            <Ionicons
              name="time-outline"
              size={11}
              color={MODERN_COLORS.textLight}
            />
            <Text style={styles.metaText}>{worker.experience} năm</Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      <View style={styles.specialtiesRow}>
        {worker.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyChip}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
        {worker.specialties.length > 3 && (
          <View style={[styles.specialtyChip, styles.specialtyMore]}>
            <Text style={styles.specialtyMoreText}>
              +{worker.specialties.length - 3}
            </Text>
          </View>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons
            name="people-outline"
            size={14}
            color={MODERN_COLORS.primary}
          />
          <Text style={styles.statText}>{worker.teamSize} người</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons
            name="checkmark-circle-outline"
            size={14}
            color={MODERN_COLORS.accent}
          />
          <Text style={styles.statText}>{worker.completedProjects} dự án</Text>
        </View>
        <View style={styles.statDivider} />
        <View
          style={[
            styles.availabilityBadge,
            worker.availability === "available"
              ? styles.availabilityAvailable
              : styles.availabilityBusy,
          ]}
        >
          <View
            style={[
              styles.availabilityDot,
              worker.availability === "available"
                ? styles.dotAvailable
                : styles.dotBusy,
            ]}
          />
          <Text
            style={[
              styles.availabilityText,
              worker.availability === "available"
                ? styles.textAvailable
                : styles.textBusy,
            ]}
          >
            {worker.availability === "available" ? "Sẵn sàng" : "Đang bận"}
          </Text>
        </View>
      </View>

      {/* Price & Action */}
      <View style={styles.priceRow}>
        <View>
          <View style={styles.priceMain}>
            <Text style={styles.priceValue}>{worker.price}</Text>
            <Text style={styles.priceUnit}>{worker.priceUnit}</Text>
          </View>
          {worker.pricePerDay && (
            <Text style={styles.priceAlt}>{worker.pricePerDay}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={onBooking}
          activeOpacity={0.8}
        >
          <Ionicons name="call-outline" size={16} color="#fff" />
          <Text style={styles.contactButtonText}>Liên hệ</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

// ============================================
// MAIN SCREEN
// ============================================

export default function PainterScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Tất cả");
  const [selectedPaintType, setSelectedPaintType] = useState("Tất cả");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    address: "",
    paintType: "",
    area: "",
    startDate: "",
    notes: "",
  });

  const filteredWorkers = WORKERS.filter((worker) => {
    const matchesSearch =
      searchQuery === "" ||
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      selectedLocation === "Tất cả" || worker.location === selectedLocation;

    const matchesPaintType =
      selectedPaintType === "Tất cả" ||
      worker.specialties.some((s) => s.includes(selectedPaintType));

    return matchesSearch && matchesLocation && matchesPaintType;
  });

  const handleBooking = (worker: Worker) => {
    setSelectedWorker(worker);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    console.log("Booking submitted:", bookingForm);
    setShowBookingModal(false);
    setBookingForm({
      name: "",
      phone: "",
      address: "",
      paintType: "",
      area: "",
      startDate: "",
      notes: "",
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedLocation("Tất cả");
    setSelectedPaintType("Tất cả");
  };

  const hasActiveFilters =
    selectedLocation !== "Tất cả" ||
    selectedPaintType !== "Tất cả" ||
    searchQuery.length > 0;

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thợ sơn</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons
            name="options-outline"
            size={20}
            color={MODERN_COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Modern Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={MODERN_COLORS.textLight}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm thợ sơn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={MODERN_COLORS.textLight}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={MODERN_COLORS.textLight}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Compact Filter Bar */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.filterChip,
                  selectedLocation === location && styles.filterChipActive,
                ]}
                onPress={() => setSelectedLocation(location)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedLocation === location &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Paint Type Filter */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PAINT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  selectedPaintType === type && styles.filterChipActive,
                ]}
                onPress={() => setSelectedPaintType(type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedPaintType === type && styles.filterChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            <Text style={styles.resultsNumber}>{filteredWorkers.length}</Text>{" "}
            thợ sơn
          </Text>
          {hasActiveFilters && (
            <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
              <Ionicons
                name="refresh-outline"
                size={14}
                color={MODERN_COLORS.primary}
              />
              <Text style={styles.resetText}>Đặt lại</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Worker Cards */}
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map((worker) => (
            <ModernWorkerCard
              key={worker.id}
              worker={worker}
              onBooking={() => handleBooking(worker)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="color-palette-outline"
                size={48}
                color={MODERN_COLORS.border}
              />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy thợ sơn</Text>
            <Text style={styles.emptySubtitle}>
              Thử thay đổi bộ lọc để tìm kiếm
            </Text>
            <TouchableOpacity onPress={resetFilters} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Đặt lại bộ lọc</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={MODERN_COLORS.primary}
            />
          </View>
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Thi công chuyên nghiệp</Text>
            <Text style={styles.infoBannerText}>
              Bảo hành màng sơn • Đội ngũ uy tín
            </Text>
          </View>
        </View>

        <View style={{ height: MODERN_SPACING.xl }} />
      </ScrollView>

      {/* Modern Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowBookingModal(false)}
          />
          <View style={styles.modalContainer}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đặt lịch thi công</Text>
              <TouchableOpacity
                onPress={() => setShowBookingModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={22} color={MODERN_COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Selected Worker Info */}
              {selectedWorker && (
                <View style={styles.selectedWorkerCard}>
                  <View style={styles.selectedWorkerAvatar}>
                    <Text style={styles.selectedWorkerEmoji}>
                      {selectedWorker.avatar}
                    </Text>
                  </View>
                  <View style={styles.selectedWorkerInfo}>
                    <Text style={styles.selectedWorkerName}>
                      {selectedWorker.name}
                    </Text>
                    <Text style={styles.selectedWorkerPrice}>
                      {selectedWorker.price}
                      {selectedWorker.priceUnit}
                    </Text>
                  </View>
                </View>
              )}

              {/* Form Fields */}
              <View style={styles.formSection}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Họ và tên <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor={MODERN_COLORS.textLight}
                    value={bookingForm.name}
                    onChangeText={(text) =>
                      setBookingForm({ ...bookingForm, name: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Số điện thoại <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor={MODERN_COLORS.textLight}
                    value={bookingForm.phone}
                    onChangeText={(text) =>
                      setBookingForm({ ...bookingForm, phone: text })
                    }
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Địa chỉ thi công <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="Nhập địa chỉ chi tiết"
                    placeholderTextColor={MODERN_COLORS.textLight}
                    value={bookingForm.address}
                    onChangeText={(text) =>
                      setBookingForm({ ...bookingForm, address: text })
                    }
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formRow}>
                  <View
                    style={[
                      styles.formGroup,
                      { flex: 1, marginRight: MODERN_SPACING.sm },
                    ]}
                  >
                    <Text style={styles.formLabel}>Loại sơn</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="VD: Sơn nước"
                      placeholderTextColor={MODERN_COLORS.textLight}
                      value={bookingForm.paintType}
                      onChangeText={(text) =>
                        setBookingForm({ ...bookingForm, paintType: text })
                      }
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.formLabel}>Diện tích (m²)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="VD: 100"
                      placeholderTextColor={MODERN_COLORS.textLight}
                      value={bookingForm.area}
                      onChangeText={(text) =>
                        setBookingForm({ ...bookingForm, area: text })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ngày bắt đầu</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={MODERN_COLORS.textLight}
                    value={bookingForm.startDate}
                    onChangeText={(text) =>
                      setBookingForm({ ...bookingForm, startDate: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ghi chú</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="Thêm ghi chú (tùy chọn)"
                    placeholderTextColor={MODERN_COLORS.textLight}
                    value={bookingForm.notes}
                    onChangeText={(text) =>
                      setBookingForm({ ...bookingForm, notes: text })
                    }
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitBooking}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Xác nhận đặt lịch</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>

              <View style={{ height: MODERN_SPACING.xl * 2 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ============================================
// MODERN MINIMAL STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    letterSpacing: -0.3,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: MODERN_SPACING.md,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.lg,
    height: 44,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    gap: MODERN_SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.text,
  },
  clearButton: {
    padding: 4,
  },

  // Filter Bar
  filterBar: {
    marginTop: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
  },
  filterChip: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.surface,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    marginRight: MODERN_SPACING.xs,
  },
  filterChipActive: {
    backgroundColor: MODERN_COLORS.primaryLight,
    borderColor: MODERN_COLORS.primary,
  },
  filterChipText: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },

  // Results Header
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.sm,
  },
  resultsCount: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
  },
  resultsNumber: {
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resetText: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },

  // Worker Card
  workerCard: {
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    ...MODERN_SHADOWS.sm,
  },
  featuredBadge: {
    position: "absolute",
    top: MODERN_SPACING.sm,
    right: MODERN_SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.warning,
    paddingHorizontal: MODERN_SPACING.xs,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.full,
    gap: 3,
  },
  featuredText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: MODERN_SPACING.sm,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: MODERN_SPACING.sm,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  workerName: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  reviewCount: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textLight,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: MODERN_COLORS.textLight,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: MODERN_COLORS.border,
    marginHorizontal: 4,
  },

  // Specialties
  specialtiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.xs,
    marginBottom: MODERN_SPACING.sm,
  },
  specialtyChip: {
    backgroundColor: MODERN_COLORS.primaryLight,
    paddingHorizontal: MODERN_SPACING.xs,
    paddingVertical: 3,
    borderRadius: MODERN_RADIUS.sm,
  },
  specialtyText: {
    fontSize: 10,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },
  specialtyMore: {
    backgroundColor: MODERN_COLORS.background,
  },
  specialtyMoreText: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
    marginBottom: MODERN_SPACING.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: MODERN_COLORS.border,
    marginHorizontal: MODERN_SPACING.sm,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.xs,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
    marginLeft: "auto",
  },
  availabilityAvailable: {
    backgroundColor: `${MODERN_COLORS.accent}15`,
  },
  availabilityBusy: {
    backgroundColor: `${MODERN_COLORS.warning}15`,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotAvailable: {
    backgroundColor: MODERN_COLORS.accent,
  },
  dotBusy: {
    backgroundColor: MODERN_COLORS.warning,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: "500",
  },
  textAvailable: {
    color: MODERN_COLORS.accent,
  },
  textBusy: {
    color: MODERN_COLORS.warning,
  },

  // Price Row
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceMain: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceValue: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },
  priceUnit: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textSecondary,
    marginLeft: 2,
  },
  priceAlt: {
    fontSize: 10,
    color: MODERN_COLORS.textLight,
    marginTop: 1,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.md,
    gap: 6,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.xl * 2,
    paddingHorizontal: MODERN_SPACING.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.md,
  },
  emptyTitle: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xs,
  },
  emptySubtitle: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.md,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
  },

  // Info Banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primaryLight,
    marginHorizontal: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.md,
    padding: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.sm,
  },
  infoBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
  infoBannerText: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginTop: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopLeftRadius: MODERN_RADIUS.xl,
    borderTopRightRadius: MODERN_RADIUS.xl,
    maxHeight: "92%",
    ...MODERN_SHADOWS.lg,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: MODERN_COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.xs,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  modalTitle: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    padding: MODERN_SPACING.md,
  },

  // Selected Worker
  selectedWorkerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
    padding: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    marginBottom: MODERN_SPACING.md,
  },
  selectedWorkerAvatar: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: MODERN_SPACING.sm,
  },
  selectedWorkerEmoji: {
    fontSize: 24,
  },
  selectedWorkerInfo: {
    flex: 1,
  },
  selectedWorkerName: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  selectedWorkerPrice: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
    marginTop: 2,
  },

  // Form
  formSection: {
    gap: MODERN_SPACING.sm,
  },
  formGroup: {
    marginBottom: MODERN_SPACING.xs,
  },
  formRow: {
    flexDirection: "row",
  },
  formLabel: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "500",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xs,
  },
  required: {
    color: MODERN_COLORS.error,
  },
  formInput: {
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.sm,
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.text,
    backgroundColor: MODERN_COLORS.background,
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  // Submit Button
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    marginTop: MODERN_SPACING.md,
    gap: MODERN_SPACING.xs,
    ...MODERN_SHADOWS.sm,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
  },
});
