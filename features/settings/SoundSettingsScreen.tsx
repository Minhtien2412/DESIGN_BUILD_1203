/**
 * Sound Settings Screen - Ringtone & Hold Music Configuration
 * Features: AI ringtones, Custom sounds, Preview player
 * Updated: 24/01/2026
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import {
    HoldMusicOption,
    RingtoneOption,
    useRingtone
} from "@/services/ringtoneService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ==================== COMPONENTS ====================

// Section Header
const SectionHeader = ({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon: string;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconContainer}>
      <Ionicons name={icon as any} size={20} color={MODERN_COLORS.primary} />
    </View>
    <View style={styles.sectionTextContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

// Sound Item
const SoundItem = ({
  item,
  isSelected,
  isPlaying,
  onSelect,
  onPreview,
}: {
  item: RingtoneOption | HoldMusicOption;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) => {
  return (
    <Pressable
      style={[styles.soundItem, isSelected && styles.soundItemSelected]}
      onPress={onSelect}
    >
      <View style={[styles.soundIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </View>

      <View style={styles.soundInfo}>
        <View style={styles.soundNameRow}>
          <Text
            style={[styles.soundName, isSelected && styles.soundNameSelected]}
          >
            {item.nameVi}
          </Text>
          {item.isAI && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={10} color="#fff" />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
        </View>
        {"mood" in item && <Text style={styles.soundMood}>{item.mood}</Text>}
      </View>

      <View style={styles.soundActions}>
        <TouchableOpacity style={styles.previewButton} onPress={onPreview}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color={MODERN_COLORS.primary}
          />
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

// Category Tabs
const CategoryTabs = ({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: { id: string; label: string }[];
  selectedCategory: string;
  onSelect: (id: string) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.categoryTabs}
  >
    {categories.map((cat) => (
      <TouchableOpacity
        key={cat.id}
        style={[
          styles.categoryTab,
          selectedCategory === cat.id && styles.categoryTabActive,
        ]}
        onPress={() => onSelect(cat.id)}
      >
        <Text
          style={[
            styles.categoryTabText,
            selectedCategory === cat.id && styles.categoryTabTextActive,
          ]}
        >
          {cat.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// AI Generation Card
const AIGenerationCard = ({
  title,
  description,
  icon,
  onGenerate,
  isGenerating,
}: {
  title: string;
  description: string;
  icon: string;
  onGenerate: () => void;
  isGenerating: boolean;
}) => (
  <TouchableOpacity
    style={styles.aiCard}
    onPress={onGenerate}
    disabled={isGenerating}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={["#667EEA", "#764BA2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.aiCardGradient}
    >
      <View style={styles.aiCardIcon}>
        <MaterialCommunityIcons name={icon as any} size={28} color="#fff" />
      </View>
      <View style={styles.aiCardContent}>
        <Text style={styles.aiCardTitle}>{title}</Text>
        <Text style={styles.aiCardDescription}>{description}</Text>
      </View>
      <View style={styles.aiCardAction}>
        {isGenerating ? (
          <Text style={styles.aiCardActionText}>Đang tạo...</Text>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color="rgba(255,255,255,0.8)"
          />
        )}
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// ==================== MAIN COMPONENT ====================
export default function SoundSettingsScreen() {
  const {
    settings,
    isPlaying,
    ringtones,
    holdMusicOptions,
    selectedRingtone,
    selectedHoldMusic,
    setRingtone,
    setHoldMusic,
    playPreview,
    stopSound,
    generateAIRingtone,
    generateAIHoldMusic,
  } = useRingtone();

  const [ringtoneCategory, setRingtoneCategory] = useState("all");
  const [holdMusicCategory, setHoldMusicCategory] = useState("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [vibrationEnabled, setVibrationEnabled] = useState(
    settings.vibrationEnabled,
  );
  const [ringtoneVolume, setRingtoneVolume] = useState(settings.ringtoneVolume);
  const [holdMusicVolume, setHoldMusicVolume] = useState(
    settings.holdMusicVolume,
  );
  const [isGeneratingRingtone, setIsGeneratingRingtone] = useState(false);
  const [isGeneratingHoldMusic, setIsGeneratingHoldMusic] = useState(false);

  // Categories
  const ringtoneCategories = [
    { id: "all", label: "Tất cả" },
    { id: "classic", label: "Cổ điển" },
    { id: "modern", label: "Hiện đại" },
    { id: "nature", label: "Thiên nhiên" },
    { id: "ai", label: "✨ AI" },
  ];

  const holdMusicCategories = [
    { id: "all", label: "Tất cả" },
    { id: "jazz", label: "Jazz" },
    { id: "classical", label: "Cổ điển" },
    { id: "lofi", label: "Lo-Fi" },
    { id: "ambient", label: "Ambient" },
    { id: "ai", label: "✨ AI" },
  ];

  // Filtered items
  const filteredRingtones =
    ringtoneCategory === "all"
      ? ringtones
      : ringtones.filter((r) => r.category === ringtoneCategory);

  const filteredHoldMusic =
    holdMusicCategory === "all"
      ? holdMusicOptions
      : holdMusicOptions.filter((m) => m.category === holdMusicCategory);

  // Handlers
  const handleSelectRingtone = useCallback(
    async (ringtone: RingtoneOption) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await setRingtone(ringtone.id);
    },
    [setRingtone],
  );

  const handleSelectHoldMusic = useCallback(
    async (music: HoldMusicOption) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await setHoldMusic(music.id);
    },
    [setHoldMusic],
  );

  const handlePreview = useCallback(
    async (item: RingtoneOption | HoldMusicOption) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (playingId === item.id) {
        await stopSound();
        setPlayingId(null);
      } else {
        await playPreview(item);
        setPlayingId(item.id);

        // Auto stop after preview
        setTimeout(() => {
          setPlayingId(null);
        }, 5000);
      }
    },
    [playingId, stopSound, playPreview],
  );

  const handleGenerateAIRingtone = useCallback(async () => {
    setIsGeneratingRingtone(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await generateAIRingtone({ mood: "calm" });

    setIsGeneratingRingtone(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [generateAIRingtone]);

  const handleGenerateAIHoldMusic = useCallback(async () => {
    setIsGeneratingHoldMusic(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await generateAIHoldMusic({ style: "ambient", contextAware: true });

    setIsGeneratingHoldMusic(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [generateAIHoldMusic]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={MODERN_COLORS.background}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Âm thanh cuộc gọi</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Volume & Vibration Settings */}
          <View style={styles.section}>
            <SectionHeader
              title="Cài đặt chung"
              subtitle="Âm lượng và rung"
              icon="settings"
            />

            <View style={styles.settingCard}>
              {/* Ringtone Volume */}
              <View style={styles.volumeSetting}>
                <View style={styles.volumeHeader}>
                  <Ionicons
                    name="volume-medium"
                    size={20}
                    color={MODERN_COLORS.text}
                  />
                  <Text style={styles.volumeLabel}>Âm lượng chuông</Text>
                  <Text style={styles.volumeValue}>
                    {Math.round(ringtoneVolume * 100)}%
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={ringtoneVolume}
                  onValueChange={setRingtoneVolume}
                  minimumTrackTintColor={MODERN_COLORS.primary}
                  maximumTrackTintColor={MODERN_COLORS.divider}
                  thumbTintColor={MODERN_COLORS.primary}
                />
              </View>

              {/* Hold Music Volume */}
              <View style={styles.volumeSetting}>
                <View style={styles.volumeHeader}>
                  <Ionicons
                    name="musical-notes"
                    size={20}
                    color={MODERN_COLORS.text}
                  />
                  <Text style={styles.volumeLabel}>Âm lượng nhạc chờ</Text>
                  <Text style={styles.volumeValue}>
                    {Math.round(holdMusicVolume * 100)}%
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={holdMusicVolume}
                  onValueChange={setHoldMusicVolume}
                  minimumTrackTintColor={MODERN_COLORS.primary}
                  maximumTrackTintColor={MODERN_COLORS.divider}
                  thumbTintColor={MODERN_COLORS.primary}
                />
              </View>

              {/* Vibration */}
              <View style={styles.switchSetting}>
                <View style={styles.switchInfo}>
                  <Ionicons
                    name="phone-portrait"
                    size={20}
                    color={MODERN_COLORS.text}
                  />
                  <Text style={styles.switchLabel}>Rung khi có cuộc gọi</Text>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{
                    false: MODERN_COLORS.divider,
                    true: `${MODERN_COLORS.primary}50`,
                  }}
                  thumbColor={
                    vibrationEnabled ? MODERN_COLORS.primary : "#f4f3f4"
                  }
                />
              </View>
            </View>
          </View>

          {/* AI Generation Section */}
          <View style={styles.section}>
            <SectionHeader
              title="Tạo âm thanh AI"
              subtitle="Tạo nhạc chuông và nhạc chờ độc đáo với AI"
              icon="sparkles"
            />

            <AIGenerationCard
              title="Tạo nhạc chuông AI"
              description="Tạo nhạc chuông độc đáo phù hợp với phong cách của bạn"
              icon="music-circle"
              onGenerate={handleGenerateAIRingtone}
              isGenerating={isGeneratingRingtone}
            />

            <AIGenerationCard
              title="Tạo nhạc chờ AI"
              description="Nhạc chờ thông minh tự động điều chỉnh theo ngữ cảnh"
              icon="playlist-music"
              onGenerate={handleGenerateAIHoldMusic}
              isGenerating={isGeneratingHoldMusic}
            />
          </View>

          {/* Ringtone Selection */}
          <View style={styles.section}>
            <SectionHeader
              title="Nhạc chuông"
              subtitle="Chọn nhạc chuông cho cuộc gọi đến"
              icon="call"
            />

            <CategoryTabs
              categories={ringtoneCategories}
              selectedCategory={ringtoneCategory}
              onSelect={setRingtoneCategory}
            />

            <View style={styles.soundList}>
              {filteredRingtones.map((ringtone) => (
                <SoundItem
                  key={ringtone.id}
                  item={ringtone}
                  isSelected={selectedRingtone?.id === ringtone.id}
                  isPlaying={playingId === ringtone.id}
                  onSelect={() => handleSelectRingtone(ringtone)}
                  onPreview={() => handlePreview(ringtone)}
                />
              ))}
            </View>
          </View>

          {/* Hold Music Selection */}
          <View style={styles.section}>
            <SectionHeader
              title="Nhạc chờ"
              subtitle="Âm nhạc phát khi đang chờ cuộc gọi"
              icon="musical-notes"
            />

            <CategoryTabs
              categories={holdMusicCategories}
              selectedCategory={holdMusicCategory}
              onSelect={setHoldMusicCategory}
            />

            <View style={styles.soundList}>
              {filteredHoldMusic.map((music) => (
                <SoundItem
                  key={music.id}
                  item={music}
                  isSelected={selectedHoldMusic?.id === music.id}
                  isPlaying={playingId === music.id}
                  onSelect={() => handleSelectHoldMusic(music)}
                  onPreview={() => handlePreview(music)}
                />
              ))}
            </View>
          </View>

          {/* Custom Ringtone */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.customRingtoneButton}>
              <Ionicons
                name="add-circle"
                size={24}
                color={MODERN_COLORS.primary}
              />
              <View style={styles.customRingtoneText}>
                <Text style={styles.customRingtoneTitle}>
                  Thêm nhạc chuông tùy chỉnh
                </Text>
                <Text style={styles.customRingtoneSubtitle}>
                  Chọn từ thư viện nhạc của bạn
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={MODERN_COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.lg,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: MODERN_SPACING.md,
  },

  // Section
  section: {
    marginBottom: MODERN_SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${MODERN_COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: MODERN_SPACING.md,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  sectionSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },

  // Settings Card
  settingCard: {
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  volumeSetting: {
    marginBottom: MODERN_SPACING.md,
  },
  volumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  volumeLabel: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },
  volumeValue: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  switchSetting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: MODERN_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.divider,
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    marginLeft: MODERN_SPACING.sm,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },

  // AI Card
  aiCard: {
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    ...MODERN_SHADOWS.md,
  },
  aiCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: MODERN_SPACING.md,
  },
  aiCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  aiCardContent: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
  },
  aiCardTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: "#fff",
  },
  aiCardDescription: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  aiCardAction: {
    paddingLeft: MODERN_SPACING.sm,
  },
  aiCardActionText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "rgba(255,255,255,0.8)",
  },

  // Category Tabs
  categoryTabs: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  categoryTab: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.surface,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  categoryTabActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  categoryTabText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },
  categoryTabTextActive: {
    color: "#fff",
  },

  // Sound List
  soundList: {
    paddingHorizontal: MODERN_SPACING.md,
  },
  soundItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    marginBottom: MODERN_SPACING.sm,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
  },
  soundItemSelected: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: `${MODERN_COLORS.primary}08`,
  },
  soundIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  soundInfo: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
  },
  soundNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  soundName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
    fontWeight: "500",
  },
  soundNameSelected: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },
  soundMood: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  soundActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  previewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${MODERN_COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  // Custom Ringtone
  customRingtoneButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
    borderStyle: "dashed",
  },
  customRingtoneText: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
  },
  customRingtoneTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: "500",
    color: MODERN_COLORS.text,
  },
  customRingtoneSubtitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
});
