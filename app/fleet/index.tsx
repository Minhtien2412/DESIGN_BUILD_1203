/**
 * Fleet Management Screen - Modern Minimalist Design
 * Features: Live status tracking, animated cards, statistics dashboard, dark mode
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { useFleetSummary, useVehicles } from "@/hooks/useFleet";
import type { VehicleStatus, VehicleType } from "@/types/fleet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VEHICLE_TYPE_ICONS: Record<VehicleType, keyof typeof Ionicons.glyphMap> =
  {
    CAR: "car",
    TRUCK: "bus",
    VAN: "car-sport",
    PICKUP: "car",
    CRANE: "construct",
    EXCAVATOR: "hammer",
    BULLDOZER: "construct",
    LOADER: "business",
    FORKLIFT: "construct",
    DUMP_TRUCK: "bus",
    CONCRETE_MIXER: "business",
    TRAILER: "bus",
    MOTORCYCLE: "bicycle",
    OTHER: "ellipse",
  };

type TabType = "vehicles" | "maintenance" | "fuel" | "trips";

const TABS: {
  id: TabType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "vehicles", label: "Phương tiện", icon: "car" },
  { id: "maintenance", label: "Bảo trì", icon: "build" },
  { id: "fuel", label: "Nhiên liệu", icon: "flame" },
  { id: "trips", label: "Chuyến đi", icon: "navigate" },
];

const STATUS_COLORS: Record<VehicleStatus, string> = {
  ACTIVE: "#10b981",
  INACTIVE: "#6b7280",
  IN_MAINTENANCE: "#f59e0b",
  IN_REPAIR: "#ef4444",
  RESERVED: "#0D9488",
  OUT_OF_SERVICE: "#ef4444",
  RETIRED: "#9ca3af",
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  color,
  icon,
  index,
}: {
  title: string;
  value: string | number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  index: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        { backgroundColor: color + "15" },
        {
          opacity: scaleAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </Animated.View>
  );
};

// Vehicle Card Component
const VehicleCard = ({
  vehicle,
  index,
  textColor,
  surfaceColor,
  borderColor,
  onPress,
}: {
  vehicle: any;
  index: number;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const statusColor =
    STATUS_COLORS[vehicle.status as VehicleStatus] || "#6b7280";

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.vehicleCardWrapper,
        {
          opacity: scaleAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.vehicleCard,
          { backgroundColor: surfaceColor, borderColor },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Live indicator for active vehicles */}
        {vehicle.status === "ACTIVE" && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}

        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleIconWrap}>
            <LinearGradient
              colors={[statusColor + "20", statusColor + "10"]}
              style={styles.vehicleIconGradient}
            >
              <Ionicons
                name={VEHICLE_TYPE_ICONS[vehicle.type as VehicleType]}
                size={28}
                color={statusColor}
              />
            </LinearGradient>
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehicleNumber, { color: textColor }]}>
              {vehicle.vehicleNumber}
            </Text>
            <Text style={[styles.vehicleMake, { color: textColor + "60" }]}>
              {vehicle.make} {vehicle.model}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "15" },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {vehicle.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        <View style={[styles.vehicleStats, { borderColor }]}>
          <View style={styles.vehicleStat}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color={textColor + "60"}
            />
            <Text style={[styles.vehicleStatValue, { color: textColor }]}>
              {vehicle.currentOdometer?.toLocaleString() || 0}
            </Text>
            <Text
              style={[styles.vehicleStatLabel, { color: textColor + "50" }]}
            >
              km
            </Text>
          </View>

          <View style={styles.vehicleStatDivider} />

          <View style={styles.vehicleStat}>
            <Ionicons name="flame-outline" size={16} color={textColor + "60"} />
            <Text style={[styles.vehicleStatValue, { color: textColor }]}>
              {vehicle.fuelType}
            </Text>
          </View>

          {vehicle.assignedDriverName && (
            <>
              <View style={styles.vehicleStatDivider} />
              <View style={styles.vehicleStat}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={textColor + "60"}
                />
                <Text
                  style={[styles.vehicleStatValue, { color: textColor }]}
                  numberOfLines={1}
                >
                  {vehicle.assignedDriverName}
                </Text>
              </View>
            </>
          )}
        </View>

        {vehicle.nextMaintenanceDate && (
          <View
            style={[styles.maintenanceAlert, { backgroundColor: "#f59e0b10" }]}
          >
            <Ionicons name="build-outline" size={14} color="#f59e0b" />
            <Text style={styles.maintenanceText}>
              Bảo trì:{" "}
              {new Date(vehicle.nextMaintenanceDate).toLocaleDateString(
                "vi-VN",
              )}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const MOCK_MAINTENANCE = [
  {
    id: "mt-1",
    vehicleNumber: "51C-123.45",
    service: "Thay dầu máy + lọc dầu",
    status: "COMPLETED" as const,
    date: "2025-01-15",
    cost: 2500000,
    mechanic: "Garage Minh Phát",
  },
  {
    id: "mt-2",
    vehicleNumber: "51C-678.90",
    service: "Thay lốp trước (4 chiếc)",
    status: "IN_PROGRESS" as const,
    date: "2025-01-14",
    cost: 12000000,
    mechanic: "Garage Hoàng Long",
  },
  {
    id: "mt-3",
    vehicleNumber: "51C-111.22",
    service: "Bảo dưỡng định kỳ 50.000km",
    status: "SCHEDULED" as const,
    date: "2025-01-20",
    cost: 5500000,
    mechanic: "Toyota Service",
  },
  {
    id: "mt-4",
    vehicleNumber: "51C-333.44",
    service: "Sửa hệ thống phanh",
    status: "COMPLETED" as const,
    date: "2025-01-10",
    cost: 3800000,
    mechanic: "Garage Minh Phát",
  },
  {
    id: "mt-5",
    vehicleNumber: "51C-555.66",
    service: "Kiểm tra hệ thống điện",
    status: "SCHEDULED" as const,
    date: "2025-01-22",
    cost: 1200000,
    mechanic: "Bosch Car Service",
  },
];

const MOCK_FUEL_LOGS = [
  {
    id: "fl-1",
    vehicleNumber: "51C-123.45",
    liters: 65,
    cost: 1625000,
    station: "Petrolimex Q7",
    date: "2025-01-15",
    odometer: 45230,
  },
  {
    id: "fl-2",
    vehicleNumber: "51C-678.90",
    liters: 120,
    cost: 3000000,
    station: "Shell Nguyễn Hữu Thọ",
    date: "2025-01-14",
    odometer: 78450,
  },
  {
    id: "fl-3",
    vehicleNumber: "51C-111.22",
    liters: 45,
    cost: 1125000,
    station: "PV Oil Trường Chinh",
    date: "2025-01-13",
    odometer: 32100,
  },
  {
    id: "fl-4",
    vehicleNumber: "51C-333.44",
    liters: 80,
    cost: 2000000,
    station: "Petrolimex Q2",
    date: "2025-01-12",
    odometer: 56780,
  },
  {
    id: "fl-5",
    vehicleNumber: "51C-555.66",
    liters: 55,
    cost: 1375000,
    station: "Shell Xa lộ Hà Nội",
    date: "2025-01-11",
    odometer: 23450,
  },
];

const MOCK_TRIPS = [
  {
    id: "tr-1",
    vehicleNumber: "51C-123.45",
    driver: "Nguyễn Văn Hùng",
    from: "Văn phòng Q1",
    to: "Công trường Thủ Đức",
    distance: 18.5,
    date: "2025-01-15",
    duration: "45 phút",
  },
  {
    id: "tr-2",
    vehicleNumber: "51C-678.90",
    driver: "Trần Quốc Bảo",
    from: "Kho vật tư Bình Chánh",
    to: "Dự án Q9",
    distance: 32.0,
    date: "2025-01-15",
    duration: "1h 15ph",
  },
  {
    id: "tr-3",
    vehicleNumber: "51C-111.22",
    driver: "Lê Minh Tuấn",
    from: "Văn phòng Q1",
    to: "Công trường Q7",
    distance: 12.3,
    date: "2025-01-14",
    duration: "30 phút",
  },
  {
    id: "tr-4",
    vehicleNumber: "51C-333.44",
    driver: "Phạm Anh Dũng",
    from: "Nhà máy BT Long An",
    to: "Dự án Nhà Bè",
    distance: 45.0,
    date: "2025-01-14",
    duration: "1h 30ph",
  },
  {
    id: "tr-5",
    vehicleNumber: "51C-555.66",
    driver: "Võ Hoàng Nam",
    from: "Văn phòng Q1",
    to: "Đại lý VLXD Q12",
    distance: 22.7,
    date: "2025-01-13",
    duration: "55 phút",
  },
];

const getMtStatusColor = (s: string) => {
  switch (s) {
    case "COMPLETED":
      return "#10b981";
    case "IN_PROGRESS":
      return "#f59e0b";
    case "SCHEDULED":
      return "#0D9488";
    default:
      return "#6b7280";
  }
};

export default function FleetScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");

  const [selectedTab, setSelectedTab] = useState<TabType>("vehicles");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "ALL">(
    "ALL",
  );

  const { summary } = useFleetSummary();
  const { vehicles, loading } = useVehicles();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredVehicles = vehicles.filter(
    (v) => statusFilter === "ALL" || v.status === statusFilter,
  );

  const handleTabPress = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };

  const handleFilterPress = (status: VehicleStatus | "ALL") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatusFilter(status);
  };

  const handleVehiclePress = (vehicleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/fleet/${vehicleId}`);
  };

  const renderVehicleItem = ({ item, index }: { item: any; index: number }) => (
    <VehicleCard
      vehicle={item}
      index={index}
      textColor={textColor}
      surfaceColor={surfaceColor}
      borderColor={borderColor}
      onPress={() => handleVehiclePress(item.id)}
    />
  );

  const renderEmptyState = (
    icon: keyof typeof Ionicons.glyphMap,
    message: string,
  ) => (
    <View
      style={[
        styles.emptyState,
        { backgroundColor: surfaceColor, borderColor },
      ]}
    >
      <View
        style={[
          styles.emptyIconWrap,
          { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
        ]}
      >
        <Ionicons
          name={icon}
          size={40}
          color={isDark ? "#6b7280" : "#9ca3af"}
        />
      </View>
      <Text style={[styles.emptyText, { color: textColor }]}>{message}</Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: surfaceColor }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: textColor }]}>
            Quản lý đội xe
          </Text>
          <Text style={[styles.subtitle, { color: textColor + "60" }]}>
            {vehicles.length} phương tiện
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: "#6366f1" }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Tổng xe"
            value={summary?.totalVehicles || 0}
            color="#6366f1"
            icon="car"
            index={0}
          />
          <StatCard
            title="Hoạt động"
            value={summary?.activeVehicles || 0}
            color="#10b981"
            icon="checkmark-circle"
            index={1}
          />
          <StatCard
            title="Bảo trì"
            value={summary?.inMaintenanceVehicles || 0}
            color="#f59e0b"
            icon="build"
            index={2}
          />
          <StatCard
            title="Hiệu suất"
            value={`${summary?.utilizationRate?.toFixed(0) || 0}%`}
            color="#0D9488"
            icon="trending-up"
            index={3}
          />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive
                      ? isDark
                        ? "#6366f1"
                        : "#1a1a1a"
                      : "transparent",
                  },
                ]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? "#fff" : textColor + "60"}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? "#fff" : textColor + "80" },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Vehicles Tab */}
        {selectedTab === "vehicles" && (
          <>
            {/* Status Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {(
                [
                  "ALL",
                  "ACTIVE",
                  "IN_MAINTENANCE",
                  "RESERVED",
                  "INACTIVE",
                ] as const
              ).map((status) => {
                const isActive = statusFilter === status;
                const count =
                  status === "ALL"
                    ? vehicles.length
                    : vehicles.filter((v) => v.status === status).length;

                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isActive
                          ? isDark
                            ? "#6366f1"
                            : "#1a1a1a"
                          : surfaceColor,
                        borderColor: isActive ? "transparent" : borderColor,
                      },
                    ]}
                    onPress={() =>
                      handleFilterPress(status as VehicleStatus | "ALL")
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: isActive ? "#fff" : textColor },
                      ]}
                    >
                      {status === "ALL" ? "Tất cả" : status.replace("_", " ")}
                    </Text>
                    {count > 0 && (
                      <View
                        style={[
                          styles.filterBadge,
                          {
                            backgroundColor: isActive
                              ? "rgba(255,255,255,0.2)"
                              : borderColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterBadgeText,
                            { color: isActive ? "#fff" : textColor + "80" },
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Vehicles List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: textColor + "60" }]}>
                  Đang tải...
                </Text>
              </View>
            ) : filteredVehicles.length === 0 ? (
              renderEmptyState("car-outline", "Không tìm thấy phương tiện")
            ) : (
              <View style={styles.vehiclesList}>
                {filteredVehicles.map((vehicle, index) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    index={index}
                    textColor={textColor}
                    surfaceColor={surfaceColor}
                    borderColor={borderColor}
                    onPress={() => handleVehiclePress(vehicle.id)}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Maintenance Tab */}
        {selectedTab === "maintenance" && (
          <>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="build" size={20} color="#f59e0b" />
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    {
                      MOCK_MAINTENANCE.filter((m) => m.status === "SCHEDULED")
                        .length
                    }
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: textColor + "60" }]}
                  >
                    Đã lên lịch
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="hourglass" size={20} color="#0D9488" />
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    {
                      MOCK_MAINTENANCE.filter((m) => m.status === "IN_PROGRESS")
                        .length
                    }
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: textColor + "60" }]}
                  >
                    Đang thực hiện
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    {
                      MOCK_MAINTENANCE.filter((m) => m.status === "COMPLETED")
                        .length
                    }
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: textColor + "60" }]}
                  >
                    Hoàn tất
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.vehiclesList}>
              {MOCK_MAINTENANCE.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.vehicleCard,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.vehicleHeader}>
                    <View style={styles.vehicleIconWrap}>
                      <LinearGradient
                        colors={[
                          getMtStatusColor(item.status) + "20",
                          getMtStatusColor(item.status) + "10",
                        ]}
                        style={styles.vehicleIconGradient}
                      >
                        <Ionicons
                          name="build"
                          size={24}
                          color={getMtStatusColor(item.status)}
                        />
                      </LinearGradient>
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text
                        style={[styles.vehicleNumber, { color: textColor }]}
                      >
                        {item.vehicleNumber}
                      </Text>
                      <Text
                        style={[
                          styles.vehicleMake,
                          { color: textColor + "60" },
                        ]}
                      >
                        {item.service}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getMtStatusColor(item.status) + "15",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getMtStatusColor(item.status) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getMtStatusColor(item.status) },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.vehicleStats, { borderColor }]}>
                    <View style={styles.vehicleStat}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={textColor + "60"}
                      />
                      <Text
                        style={[styles.vehicleStatValue, { color: textColor }]}
                      >
                        {item.date}
                      </Text>
                    </View>
                    <View style={styles.vehicleStatDivider} />
                    <View style={styles.vehicleStat}>
                      <Ionicons
                        name="cash-outline"
                        size={16}
                        color={textColor + "60"}
                      />
                      <Text
                        style={[styles.vehicleStatValue, { color: textColor }]}
                      >
                        {(item.cost / 1000000).toFixed(1)}M đ
                      </Text>
                    </View>
                    <View style={styles.vehicleStatDivider} />
                    <View style={styles.vehicleStat}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={textColor + "60"}
                      />
                      <Text
                        style={[styles.vehicleStatValue, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {item.mechanic}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Fuel Tab */}
        {selectedTab === "fuel" && (
          <>
            {/* Fuel Summary */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="flame" size={20} color="#f59e0b" />
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    {summary?.fuelConsumptionThisMonth?.toLocaleString() || 0} L
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: textColor + "60" }]}
                  >
                    Tiêu thụ tháng
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="wallet" size={20} color="#10b981" />
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    {((summary?.fuelCostThisMonth || 0) / 1000000).toFixed(1)}M
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: textColor + "60" }]}
                  >
                    Chi phí
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="speedometer" size={20} color="#0D9488" />
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    {summary?.averageFuelEfficiency?.toFixed(1) || 0}
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: textColor + "60" }]}
                  >
                    km/L
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.vehiclesList}>
              {MOCK_FUEL_LOGS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.vehicleCard,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.vehicleHeader}>
                    <View style={styles.vehicleIconWrap}>
                      <LinearGradient
                        colors={["#f59e0b20", "#f59e0b10"]}
                        style={styles.vehicleIconGradient}
                      >
                        <Ionicons name="flame" size={24} color="#f59e0b" />
                      </LinearGradient>
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text
                        style={[styles.vehicleNumber, { color: textColor }]}
                      >
                        {item.vehicleNumber}
                      </Text>
                      <Text
                        style={[
                          styles.vehicleMake,
                          { color: textColor + "60" },
                        ]}
                      >
                        {item.station}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[styles.vehicleNumber, { color: "#f59e0b" }]}
                      >
                        {item.liters}L
                      </Text>
                      <Text
                        style={{
                          color: textColor + "60",
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {(item.cost / 1000).toFixed(0)}K đ
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.vehicleStats, { borderColor }]}>
                    <View style={styles.vehicleStat}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={textColor + "60"}
                      />
                      <Text
                        style={[styles.vehicleStatValue, { color: textColor }]}
                      >
                        {item.date}
                      </Text>
                    </View>
                    <View style={styles.vehicleStatDivider} />
                    <View style={styles.vehicleStat}>
                      <Ionicons
                        name="speedometer-outline"
                        size={16}
                        color={textColor + "60"}
                      />
                      <Text
                        style={[styles.vehicleStatValue, { color: textColor }]}
                      >
                        {item.odometer.toLocaleString()} km
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Trips Tab */}
        {selectedTab === "trips" && (
          <>
            {/* Trips Summary */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="navigate" size={20} color="#6366f1" />
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    {summary?.tripsThisMonth || 0}
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: textColor + "60" }]}
                  >
                    Chuyến đi
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="map" size={20} color="#10b981" />
                  <Text style={[styles.summaryValue, { color: textColor }]}>
                    {summary?.distanceThisMonth?.toLocaleString() || 0}
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: textColor + "60" }]}
                  >
                    km
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.vehiclesList}>
              {MOCK_TRIPS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.vehicleCard,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.vehicleHeader}>
                    <View style={styles.vehicleIconWrap}>
                      <LinearGradient
                        colors={["#6366f120", "#6366f110"]}
                        style={styles.vehicleIconGradient}
                      >
                        <Ionicons name="navigate" size={24} color="#6366f1" />
                      </LinearGradient>
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text
                        style={[styles.vehicleNumber, { color: textColor }]}
                      >
                        {item.vehicleNumber}
                      </Text>
                      <Text
                        style={[
                          styles.vehicleMake,
                          { color: textColor + "60" },
                        ]}
                      >
                        {item.driver}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[styles.vehicleNumber, { color: "#6366f1" }]}
                      >
                        {item.distance} km
                      </Text>
                      <Text
                        style={{
                          color: textColor + "60",
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {item.duration}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.vehicleStats, { borderColor }]}>
                    <View style={[styles.vehicleStat, { flex: 2 }]}>
                      <Ionicons name="location" size={14} color="#10b981" />
                      <Text
                        style={[styles.vehicleStatValue, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {item.from}
                      </Text>
                    </View>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={textColor + "40"}
                    />
                    <View style={[styles.vehicleStat, { flex: 2 }]}>
                      <Ionicons name="flag" size={14} color="#ef4444" />
                      <Text
                        style={[styles.vehicleStatValue, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {item.to}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.maintenanceAlert,
                      { backgroundColor: "#6366f110" },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#6366f1"
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#6366f1",
                      }}
                    >
                      {item.date}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  filterScroll: {
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "500",
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  vehiclesList: {
    gap: 12,
  },
  vehicleCardWrapper: {},
  vehicleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: "hidden",
  },
  liveIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#10b98115",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10b981",
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vehicleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
  },
  vehicleIconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 17,
    fontWeight: "700",
  },
  vehicleMake: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  vehicleStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  vehicleStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  vehicleStatValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  vehicleStatLabel: {
    fontSize: 12,
  },
  vehicleStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#e5e7eb",
  },
  maintenanceAlert: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  maintenanceText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#f59e0b",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: "#e5e7eb",
  },
  bottomPadding: {
    height: 100,
  },
});
