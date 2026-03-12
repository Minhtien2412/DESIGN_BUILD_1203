/**
 * Premium Habit Tracker Screen
 * ================================================
 * Features:
 * - Animated SVG progress rings with smooth transitions
 * - Weekly completion bar charts
 * - Streak tracking with fire badges 🔥
 * - Glassmorphism cards with blur backdrop
 * - Interactive habit cards with spring physics
 * - Staggered entrance animations
 *
 * Stack: React Native • Expo • TypeScript • Reanimated • SVG • BlurView
 */

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, {
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    FadeInDown,
    FadeInRight,
    FadeInUp,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circle, Svg } from "react-native-svg";

const { width: SW } = Dimensions.get("window");
const SPRING = { damping: 14, stiffness: 160, mass: 0.8 };
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const C = {
  bg: "#0F0F1A",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.1)",
  glassBg: "rgba(255,255,255,0.08)",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.5)",
  textSoft: "rgba(255,255,255,0.7)",
  accent: "#14B8A6",
  accentDark: "#0D9488",
  purple: "#8B5CF6",
  pink: "#EC4899",
  orange: "#F97316",
  blue: "#3B82F6",
  yellow: "#EAB308",
  green: "#22C55E",
  red: "#EF4444",
  streak: "#FF6B35",
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
interface Habit {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: [string, string];
  target: number;
  completed: number;
  unit: string;
  streak: number;
  weekData: number[]; // 7 days Mon-Sun (0-100%)
}

const HABITS: Habit[] = [
  {
    id: "1",
    name: "Thiền định",
    icon: "leaf-outline",
    color: C.accent,
    gradient: ["#0D9488", "#14B8A6"],
    target: 20,
    completed: 15,
    unit: "phút",
    streak: 12,
    weekData: [100, 100, 80, 100, 90, 100, 75],
  },
  {
    id: "2",
    name: "Đọc sách",
    icon: "book-outline",
    color: C.purple,
    gradient: ["#7C3AED", "#8B5CF6"],
    target: 30,
    completed: 22,
    unit: "trang",
    streak: 7,
    weekData: [80, 60, 100, 70, 90, 85, 0],
  },
  {
    id: "3",
    name: "Tập thể dục",
    icon: "barbell-outline",
    color: C.orange,
    gradient: ["#EA580C", "#F97316"],
    target: 45,
    completed: 45,
    unit: "phút",
    streak: 21,
    weekData: [100, 100, 100, 100, 100, 100, 100],
  },
  {
    id: "4",
    name: "Uống nước",
    icon: "water-outline",
    color: C.blue,
    gradient: ["#2563EB", "#3B82F6"],
    target: 8,
    completed: 5,
    unit: "ly",
    streak: 3,
    weekData: [90, 70, 60, 80, 50, 65, 0],
  },
  {
    id: "5",
    name: "Ngủ sớm",
    icon: "moon-outline",
    color: C.pink,
    gradient: ["#DB2777", "#EC4899"],
    target: 1,
    completed: 1,
    unit: "lần",
    streak: 5,
    weekData: [100, 0, 100, 100, 100, 0, 100],
  },
];

const WEEK_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// ═══════════════════════════════════════════════════════════════
// ANIMATED PROGRESS RING
// ═══════════════════════════════════════════════════════════════
const ProgressRing = ({
  progress,
  size = 72,
  strokeWidth = 6,
  color,
  delay = 0,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  delay?: number;
}) => {
  const animProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animProgress.value = withDelay(
      delay,
      withSpring(Math.min(progress, 1), { damping: 20, stiffness: 80 }),
    );
  }, [progress, delay]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animProgress.value),
  }));

  return (
    <Svg
      width={size}
      height={size}
      style={{ transform: [{ rotate: "-90deg" }] }}
    >
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        strokeLinecap="round"
      />
    </Svg>
  );
};

// ═══════════════════════════════════════════════════════════════
// STREAK BADGE WITH FIRE ANIMATION
// ═══════════════════════════════════════════════════════════════
const StreakBadge = ({
  streak,
  delay = 0,
}: {
  streak: number;
  delay?: number;
}) => {
  const fireScale = useSharedValue(1);

  useEffect(() => {
    fireScale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(1.15, { damping: 4, stiffness: 200 }),
          withSpring(1, { damping: 8, stiffness: 200 }),
        ),
        -1,
        true,
      ),
    );
  }, [delay]);

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  if (streak < 3) return null;

  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify()}
      style={styles.streakBadge}
    >
      <Animated.Text style={[styles.streakFire, fireStyle]}>🔥</Animated.Text>
      <Text style={styles.streakCount}>{streak}</Text>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// WEEKLY BAR CHART
// ═══════════════════════════════════════════════════════════════
const WeeklyChart = ({
  data,
  color,
  delay = 0,
}: {
  data: number[];
  color: string;
  delay?: number;
}) => {
  return (
    <View style={styles.chartContainer}>
      {data.map((value, i) => {
        const isToday = i === new Date().getDay() - 1; // Mon=0
        return (
          <Animated.View
            key={i}
            entering={FadeInUp.delay(delay + i * 40).springify()}
            style={styles.chartBarCol}
          >
            <View style={styles.chartBarBg}>
              <Animated.View
                entering={FadeInUp.delay(delay + 200 + i * 60).springify()}
                style={[
                  styles.chartBarFill,
                  {
                    height: `${Math.max(value, 4)}%`,
                    backgroundColor:
                      value >= 80
                        ? color
                        : value >= 50
                          ? color + "80"
                          : color + "30",
                    borderRadius: 4,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.chartLabel,
                isToday && { color: "#FFF", fontWeight: "700" },
              ]}
            >
              {WEEK_LABELS[i]}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// HABIT CARD
// ═══════════════════════════════════════════════════════════════
const HabitCard = React.memo(
  ({ habit, index }: { habit: Habit; index: number }) => {
    const [expanded, setExpanded] = useState(false);
    const scale = useSharedValue(1);
    const expandAnim = useSharedValue(0);
    const progress = habit.completed / habit.target;
    const isComplete = progress >= 1;
    const delayMs = index * 100;

    const cardStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const expandStyle = useAnimatedStyle(() => ({
      maxHeight: interpolate(expandAnim.value, [0, 1], [0, 120]),
      opacity: expandAnim.value,
      marginTop: interpolate(expandAnim.value, [0, 1], [0, 12]),
    }));

    const toggleExpand = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = !expanded;
      setExpanded(next);
      expandAnim.value = withSpring(next ? 1 : 0, SPRING);
    };

    const onPressIn = () => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    };
    const onPressOut = () => {
      scale.value = withSpring(1, SPRING);
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(delayMs).springify()}
        style={cardStyle}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggleExpand}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <View style={styles.habitCard}>
            {/* Main row */}
            <View style={styles.habitRow}>
              {/* Progress Ring + Icon */}
              <View style={styles.habitRingContainer}>
                <ProgressRing
                  progress={progress}
                  color={habit.color}
                  delay={delayMs + 200}
                />
                <View
                  style={[
                    styles.habitIconOverlay,
                    { backgroundColor: habit.color + "20" },
                  ]}
                >
                  <Ionicons name={habit.icon} size={22} color={habit.color} />
                </View>
              </View>

              {/* Info */}
              <View style={styles.habitInfo}>
                <View style={styles.habitNameRow}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <StreakBadge streak={habit.streak} delay={delayMs + 300} />
                </View>
                <Text style={styles.habitProgress}>
                  <Text style={{ color: habit.color, fontWeight: "700" }}>
                    {habit.completed}
                  </Text>
                  {" / "}
                  {habit.target} {habit.unit}
                </Text>
                {/* Mini progress bar */}
                <View style={styles.miniBar}>
                  <Animated.View
                    entering={FadeInRight.delay(delayMs + 400)}
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${Math.min(progress * 100, 100)}%`,
                        backgroundColor: habit.color,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Complete badge */}
              {isComplete && (
                <Animated.View
                  entering={FadeInRight.delay(delayMs + 500).springify()}
                  style={styles.completeBadge}
                >
                  <Ionicons name="checkmark-circle" size={28} color={C.green} />
                </Animated.View>
              )}

              {/* Expand arrow */}
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={C.textMuted}
                style={{ marginLeft: 8 }}
              />
            </View>

            {/* Expanded: Weekly chart */}
            <Animated.View style={expandStyle}>
              <View style={styles.chartDivider} />
              <Text style={styles.chartTitle}>Tuần này</Text>
              <WeeklyChart
                data={habit.weekData}
                color={habit.color}
                delay={0}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════
// OVERALL PROGRESS RING (BIG)
// ═══════════════════════════════════════════════════════════════
const OverallProgress = ({ habits }: { habits: Habit[] }) => {
  const totalProgress =
    habits.reduce((sum, h) => sum + Math.min(h.completed / h.target, 1), 0) /
    habits.length;
  const completedCount = habits.filter((h) => h.completed >= h.target).length;
  const totalStreak = Math.max(...habits.map((h) => h.streak));

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={styles.overallCard}
    >
      <BlurView intensity={20} tint="dark" style={styles.overallBlur}>
        <View style={styles.overallContent}>
          {/* Big ring */}
          <View style={styles.overallRingContainer}>
            <ProgressRing
              progress={totalProgress}
              size={120}
              strokeWidth={10}
              color={C.accent}
              delay={300}
            />
            <View style={styles.overallRingCenter}>
              <Text style={styles.overallPercent}>
                {Math.round(totalProgress * 100)}%
              </Text>
              <Text style={styles.overallLabel}>hoàn thành</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.overallStats}>
            <Animated.View
              entering={FadeInRight.delay(400).springify()}
              style={styles.statItem}
            >
              <Text style={styles.statValue}>
                {completedCount}/{habits.length}
              </Text>
              <Text style={styles.statLabel}>Đã xong</Text>
            </Animated.View>
            <View style={styles.statDivider} />
            <Animated.View
              entering={FadeInRight.delay(500).springify()}
              style={styles.statItem}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.statValue}>{totalStreak}</Text>
                <Text style={{ fontSize: 16, marginLeft: 2 }}>🔥</Text>
              </View>
              <Text style={styles.statLabel}>Chuỗi dài nhất</Text>
            </Animated.View>
            <View style={styles.statDivider} />
            <Animated.View
              entering={FadeInRight.delay(600).springify()}
              style={styles.statItem}
            >
              <Text style={styles.statValue}>
                {habits.reduce((s, h) => s + h.streak, 0)}
              </Text>
              <Text style={styles.statLabel}>Tổng streak</Text>
            </Animated.View>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════
export default function HabitTrackerScreen() {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState(HABITS);

  const today = useMemo(() => {
    const d = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return d.toLocaleDateString("vi-VN", options);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background gradient */}
      <LinearGradient
        colors={["#0F0F1A", "#1A1A2E", "#16213E"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào! 👋</Text>
            <Text style={styles.dateText}>{today}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color={C.textSoft} />
          </TouchableOpacity>
        </Animated.View>

        {/* Overall Progress */}
        <OverallProgress habits={habits} />

        {/* Section Header */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Thói quen hôm nay</Text>
          <TouchableOpacity style={styles.addBtn}>
            <LinearGradient
              colors={[C.accent, C.accentDark]}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Habit Cards */}
        {habits.map((habit, index) => (
          <HabitCard key={habit.id} habit={habit} index={index} />
        ))}

        {/* Motivational quote */}
        <Animated.View
          entering={FadeInDown.delay(800).springify()}
          style={styles.quoteCard}
        >
          <BlurView intensity={15} tint="dark" style={styles.quoteBlur}>
            <Text style={styles.quoteEmoji}>💪</Text>
            <Text style={styles.quoteText}>
              "Kỷ luật là cầu nối giữa mục tiêu và thành tựu"
            </Text>
            <Text style={styles.quoteAuthor}>— Jim Rohn</Text>
          </BlurView>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 4,
    textTransform: "capitalize",
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.glassBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },

  // Overall Progress
  overallCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  overallBlur: { padding: 24, borderRadius: 24 },
  overallContent: { alignItems: "center" },
  overallRingContainer: { position: "relative", marginBottom: 20 },
  overallRingCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  overallPercent: { fontSize: 32, fontWeight: "800", color: C.text },
  overallLabel: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  overallStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 22, fontWeight: "700", color: C.text },
  statLabel: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  statDivider: { width: 1, height: 32, backgroundColor: C.cardBorder },

  // Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  addBtn: {},
  addBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Habit Card
  habitCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  habitRow: { flexDirection: "row", alignItems: "center" },
  habitRingContainer: { position: "relative", width: 72, height: 72 },
  habitIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 36,
    margin: 14,
  },
  habitInfo: { flex: 1, marginLeft: 14 },
  habitNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  habitName: { fontSize: 16, fontWeight: "700", color: C.text },
  habitProgress: { fontSize: 13, color: C.textMuted, marginBottom: 8 },
  miniBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  miniBarFill: { height: "100%", borderRadius: 2 },
  completeBadge: { marginLeft: 4 },

  // Streak
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,107,53,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 2,
  },
  streakFire: { fontSize: 12 },
  streakCount: { fontSize: 12, fontWeight: "700", color: C.streak },

  // Chart
  chartDivider: { height: 1, backgroundColor: C.cardBorder, marginBottom: 10 },
  chartTitle: { fontSize: 12, color: C.textMuted, marginBottom: 8 },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 60,
  },
  chartBarCol: { alignItems: "center", flex: 1 },
  chartBarBg: {
    flex: 1,
    width: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBarFill: { width: "100%" },
  chartLabel: { fontSize: 10, color: C.textMuted, marginTop: 4 },

  // Quote
  quoteCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  quoteBlur: { padding: 24, alignItems: "center", borderRadius: 20 },
  quoteEmoji: { fontSize: 32, marginBottom: 12 },
  quoteText: {
    fontSize: 15,
    color: C.textSoft,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
  },
  quoteAuthor: { fontSize: 12, color: C.textMuted, marginTop: 8 },
});
