import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Image,
    Linking,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { DSCard, DSChip, DSEmptyState } from "@/components/ds";
import { DSModuleScreen } from "@/components/ds/layouts";
import { useDS } from "@/hooks/useDS";

// Mock data - Quality Consultants
const CONSULTANTS = [
  {
    id: 1,
    name: "KS. Nguyễn Văn An",
    specialty: "Giám định kết cấu",
    experience: 15,
    education: "Đại học Xây dựng Hà Nội",
    rating: 4.9,
    reviews: 127,
    rate: "800.000₫",
    rateUnit: "/ buổi",
    image: "https://i.pravatar.cc/150?img=12",
    certifications: ["Kỹ sư xây dựng dân dụng", "Chứng chỉ giám định"],
    languages: ["Tiếng Việt", "English"],
    availability: "Sáng thứ 2-6",
    projects: 150,
    featured: true,
  },
  {
    id: 2,
    name: "KS. Trần Thị Hoa",
    specialty: "Tư vấn chất lượng vật liệu",
    experience: 12,
    education: "Đại học Bách Khoa TP.HCM",
    rating: 4.8,
    reviews: 98,
    rate: "750.000₫",
    rateUnit: "/ buổi",
    image: "https://i.pravatar.cc/150?img=47",
    certifications: ["Kỹ sư vật liệu xây dựng", "Chuyên gia chất lượng"],
    languages: ["Tiếng Việt"],
    availability: "Chiều thứ 2-6",
    projects: 120,
    featured: true,
  },
  {
    id: 3,
    name: "KS. Lê Minh Tuấn",
    specialty: "Giám định an toàn công trình",
    experience: 18,
    education: "Đại học Xây dựng",
    rating: 5.0,
    reviews: 156,
    rate: "900.000₫",
    rateUnit: "/ buổi",
    image: "https://i.pravatar.cc/150?img=33",
    certifications: ["Kỹ sư xây dựng công trình", "Chứng chỉ an toàn lao động"],
    languages: ["Tiếng Việt", "English", "日本語"],
    availability: "Linh hoạt",
    projects: 200,
    featured: false,
  },
  {
    id: 4,
    name: "KS. Phạm Thu Hằng",
    specialty: "Tư vấn thiết kế kỹ thuật",
    experience: 10,
    education: "Đại học Kiến trúc TP.HCM",
    rating: 4.7,
    reviews: 84,
    rate: "700.000₫",
    rateUnit: "/ buổi",
    image: "https://i.pravatar.cc/150?img=45",
    certifications: ["Kỹ sư kiến trúc", "Tư vấn giám sát"],
    languages: ["Tiếng Việt", "English"],
    availability: "Sáng & chiều thứ 3-7",
    projects: 95,
    featured: false,
  },
  {
    id: 5,
    name: "KS. Hoàng Đức Minh",
    specialty: "Kiểm định chất lượng thi công",
    experience: 14,
    education: "Đại học Xây dựng Miền Trung",
    rating: 4.9,
    reviews: 112,
    rate: "850.000₫",
    rateUnit: "/ buổi",
    image: "https://i.pravatar.cc/150?img=68",
    certifications: ["Kỹ sư xây dựng", "ISO 9001 Lead Auditor"],
    languages: ["Tiếng Việt"],
    availability: "Thứ 2-6",
    projects: 140,
    featured: false,
  },
  {
    id: 6,
    name: "KS. Vũ Thị Mai",
    specialty: "Tư vấn mua nhà & nghiệm thu",
    experience: 8,
    education: "Đại học Kinh tế Xây dựng",
    rating: 4.8,
    reviews: 67,
    rate: "650.000₫",
    rateUnit: "/ buổi",
    image: "https://i.pravatar.cc/150?img=20",
    certifications: ["Kỹ sư xây dựng", "Chứng chỉ thẩm định giá"],
    languages: ["Tiếng Việt", "English"],
    availability: "Cuối tuần",
    projects: 80,
    featured: false,
  },
];

const SPECIALTIES = [
  "Tất cả",
  "Giám định kết cấu",
  "Chất lượng vật liệu",
  "An toàn công trình",
  "Thiết kế kỹ thuật",
  "Kiểm định thi công",
  "Nghiệm thu",
];

const SORT_OPTIONS = [
  { label: "Đề xuất", value: "featured" },
  { label: "Đánh giá cao", value: "rating" },
  { label: "Kinh nghiệm nhiều", value: "experience" },
  { label: "Giá thấp", value: "price_asc" },
  { label: "Giá cao", value: "price_desc" },
];

export default function QualityConsultingScreen() {
  const { colors, spacing, radius, font, text: textStyles } = useDS();
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);

  const filteredConsultants = CONSULTANTS.filter((consultant) => {
    const matchSpecialty =
      selectedSpecialty === "Tất cả" ||
      consultant.specialty.includes(selectedSpecialty);
    const matchSearch =
      searchQuery === "" ||
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSpecialty && matchSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "featured":
        return b.featured ? 1 : -1;
      case "rating":
        return b.rating - a.rating;
      case "experience":
        return b.experience - a.experience;
      case "price_asc":
        return (
          parseInt(a.rate.replace(/\D/g, "")) -
          parseInt(b.rate.replace(/\D/g, ""))
        );
      case "price_desc":
        return (
          parseInt(b.rate.replace(/\D/g, "")) -
          parseInt(a.rate.replace(/\D/g, ""))
        );
      default:
        return 0;
    }
  });

  const handleBooking = (consultant: any) => {
    setSelectedConsultant(consultant);
  };

  const handleCallConsultant = () => {
    Linking.openURL("tel:1900123456");
  };

  const renderStars = (rating: number) => (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={
            star <= rating
              ? "star"
              : star - 0.5 <= rating
                ? "star-half"
                : "star-outline"
          }
          size={16}
          color={colors.primary}
        />
      ))}
    </View>
  );

  const renderCard = (consultant: (typeof CONSULTANTS)[0]) => (
    <DSCard
      key={consultant.id}
      variant="elevated"
      padding={0}
      onPress={() => {}}
      style={{ marginBottom: spacing.lg, overflow: "hidden" }}
    >
      {consultant.featured && (
        <View
          style={{
            position: "absolute",
            top: spacing.md,
            right: spacing.md,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.sm,
            zIndex: 1,
            gap: spacing.xs,
          }}
        >
          <Ionicons name="star" size={12} color={colors.textInverse} />
          <Text style={[textStyles.badge, { color: colors.textInverse }]}>
            Nổi bật
          </Text>
        </View>
      )}

      <View style={{ padding: spacing.xl }}>
        {/* Avatar & Basic Info */}
        <View style={{ flexDirection: "row", marginBottom: spacing.md }}>
          <Image
            source={{ uri: consultant.image }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: colors.bgMuted,
            }}
          />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text
              style={[
                textStyles.bodySemibold,
                { color: colors.text, marginBottom: spacing.xs },
              ]}
            >
              {consultant.name}
            </Text>
            <Text
              style={[
                textStyles.caption,
                { color: colors.textSecondary, marginBottom: spacing.sm },
              ]}
            >
              {consultant.specialty}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.xs,
                }}
              >
                <Ionicons name="star" size={14} color={colors.primary} />
                <Text
                  style={[textStyles.smallBold, { fontSize: font.size.sm }]}
                >
                  {consultant.rating}
                </Text>
                <Text
                  style={[textStyles.caption, { color: colors.textTertiary }]}
                >
                  ({consultant.reviews})
                </Text>
              </View>
              <View
                style={{
                  width: 1,
                  height: 12,
                  backgroundColor: colors.divider,
                  marginHorizontal: spacing.sm,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.xs,
                }}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  style={[textStyles.caption, { color: colors.textSecondary }]}
                >
                  {consultant.experience} năm
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Education & Certifications */}
        <View style={{ marginBottom: spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.sm,
              gap: spacing.sm,
            }}
          >
            <Ionicons
              name="school-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[
                textStyles.caption,
                { color: colors.textSecondary, flex: 1 },
              ]}
            >
              {consultant.education}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
          >
            {consultant.certifications
              .slice(0, 2)
              .map((cert: string, index: number) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.primaryBg,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: radius.sm,
                  }}
                >
                  <Text style={[textStyles.badge, { color: colors.primary }]}>
                    {cert}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {/* Additional Info */}
        <View
          style={{
            flexDirection: "row",
            gap: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.textTertiary}
            />
            <Text style={[textStyles.badge, { color: colors.textTertiary }]}>
              {consultant.availability}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <Ionicons
              name="language-outline"
              size={14}
              color={colors.textTertiary}
            />
            <Text style={[textStyles.badge, { color: colors.textTertiary }]}>
              {consultant.languages.join(", ")}
            </Text>
          </View>
        </View>

        {/* Price & Action */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={[
                textStyles.bodySemibold,
                {
                  color: colors.primary,
                  fontWeight: font.weight.bold,
                  fontSize: 18,
                },
              ]}
            >
              {consultant.rate}
            </Text>
            <Text
              style={[
                textStyles.caption,
                { color: colors.textTertiary, marginLeft: spacing.xs },
              ]}
            >
              {consultant.rateUnit}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: radius.md,
              gap: spacing.sm,
            }}
            onPress={() => handleBooking(consultant)}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.textInverse}
            />
            <Text
              style={[textStyles.buttonSmall, { color: colors.textInverse }]}
            >
              Đặt lịch
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </DSCard>
  );

  return (
    <>
      <DSModuleScreen title="Tư vấn chất lượng" gradientHeader>
        {/* Search & Sort Bar */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.bgSurface,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            gap: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.bgMuted,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              height: 40,
            }}
          >
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: spacing.sm,
                fontSize: font.size.sm,
                color: colors.text,
              }}
              placeholder="Tìm chuyên gia, chuyên môn..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              backgroundColor: colors.bgMuted,
              borderRadius: radius.md,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons
              name="swap-vertical"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Specialty Filter */}
        <View
          style={{
            backgroundColor: colors.bgSurface,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: spacing.md,
              gap: spacing.sm,
            }}
          >
            {SPECIALTIES.map((specialty) => (
              <DSChip
                key={specialty}
                label={specialty}
                selected={selectedSpecialty === specialty}
                onPress={() => setSelectedSpecialty(specialty)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Results Info */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: colors.bgSurface,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}
        >
          <Text style={[textStyles.smallBold, { color: colors.text }]}>
            {filteredConsultants.length} chuyên gia
          </Text>
          <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
            {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
          </Text>
        </View>

        {/* Consultants List */}
        <View style={{ padding: spacing.lg }}>
          {filteredConsultants.length > 0 ? (
            filteredConsultants.map((consultant) => renderCard(consultant))
          ) : (
            <DSEmptyState
              icon="person-outline"
              title="Không tìm thấy chuyên gia phù hợp"
              actionLabel="Đặt lại bộ lọc"
              onAction={() => {
                setSelectedSpecialty("Tất cả");
                setSearchQuery("");
              }}
            />
          )}
        </View>

        {/* Info Banner */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.primaryBg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            gap: spacing.sm,
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.primary}
          />
          <Text
            style={[textStyles.caption, { color: colors.primary, flex: 1 }]}
          >
            Tư vấn miễn phí 15 phút đầu tiên • Hỗ trợ 24/7
          </Text>
        </View>
      </DSModuleScreen>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View
            style={{
              backgroundColor: colors.bgSurface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: spacing.xl,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              }}
            >
              <Text style={[textStyles.bodySemibold, { color: colors.text }]}>
                Sắp xếp theo
              </Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                }}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    textStyles.body,
                    {
                      color:
                        sortBy === option.value ? colors.primary : colors.text,
                    },
                    sortBy === option.value && {
                      fontWeight: font.weight.semibold,
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Booking Modal */}
      <Modal
        visible={selectedConsultant !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedConsultant(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.bgSurface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              maxHeight: "85%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              }}
            >
              <Text style={[textStyles.h3, { color: colors.text }]}>
                Đặt lịch tư vấn
              </Text>
              <TouchableOpacity onPress={() => setSelectedConsultant(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedConsultant && (
              <ScrollView style={{ padding: spacing.lg }}>
                {/* Consultant Info */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: spacing.lg,
                  }}
                >
                  <Image
                    source={{ uri: selectedConsultant.image }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: colors.bgMuted,
                    }}
                  />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text
                      style={[
                        textStyles.bodySemibold,
                        { color: colors.text, marginBottom: spacing.xs },
                      ]}
                    >
                      {selectedConsultant.name}
                    </Text>
                    <Text
                      style={[
                        textStyles.caption,
                        {
                          color: colors.textSecondary,
                          marginBottom: spacing.sm,
                        },
                      ]}
                    >
                      {selectedConsultant.specialty}
                    </Text>
                    {renderStars(selectedConsultant.rating)}
                  </View>
                </View>

                {/* Service Info */}
                <View
                  style={{
                    backgroundColor: colors.bgMuted,
                    borderRadius: radius.lg,
                    padding: spacing.lg,
                    marginBottom: spacing.lg,
                  }}
                >
                  {[
                    {
                      label: "Phí tư vấn",
                      value: `${selectedConsultant.rate}${selectedConsultant.rateUnit}`,
                    },
                    {
                      label: "Thời gian khả dụng",
                      value: selectedConsultant.availability,
                    },
                    {
                      label: "Số dự án đã tư vấn",
                      value: `${selectedConsultant.projects}+`,
                    },
                  ].map((row, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: i < 2 ? spacing.sm : 0,
                      }}
                    >
                      <Text
                        style={[
                          textStyles.caption,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {row.label}
                      </Text>
                      <Text
                        style={[
                          textStyles.bodySemibold,
                          { color: colors.text, fontSize: font.size.sm },
                        ]}
                      >
                        {row.value}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Contact Options */}
                <View style={{ marginBottom: spacing.lg }}>
                  <Text
                    style={[
                      textStyles.bodySemibold,
                      { color: colors.text, marginBottom: spacing.md },
                    ]}
                  >
                    Liên hệ đặt lịch
                  </Text>

                  {[
                    {
                      icon: "call" as const,
                      label: "Gọi điện thoại",
                      sub: "1900 123 456",
                      onPress: handleCallConsultant,
                    },
                    {
                      icon: "chatbubbles" as const,
                      label: "Nhắn tin Zalo",
                      sub: "Phản hồi trong 5 phút",
                      onPress: () => {},
                    },
                    {
                      icon: "mail" as const,
                      label: "Gửi email",
                      sub: "Phản hồi trong 24h",
                      onPress: () => {},
                    },
                  ].map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.bgMuted,
                        padding: spacing.md,
                        borderRadius: radius.lg,
                        marginBottom: spacing.sm,
                      }}
                      onPress={opt.onPress}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: colors.bgSurface,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name={opt.icon}
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <Text
                          style={[
                            textStyles.bodySemibold,
                            {
                              color: colors.text,
                              fontSize: font.size.sm,
                              marginBottom: 2,
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text
                          style={[
                            textStyles.caption,
                            { color: colors.textTertiary },
                          ]}
                        >
                          {opt.sub}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.divider}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Notes */}
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: colors.warningBg,
                    padding: spacing.md,
                    borderRadius: radius.md,
                    gap: spacing.sm,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={colors.warning}
                  />
                  <Text
                    style={[
                      textStyles.caption,
                      { flex: 1, color: colors.textSecondary, lineHeight: 18 },
                    ]}
                  >
                    Vui lòng đặt lịch trước ít nhất 2 ngày. Bạn sẽ nhận được xác
                    nhận qua email/SMS.
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
