/**
 * Request Sent — S12
 * Confirms to customer that the service request has been dispatched
 * to nearby providers. Shows summary + estimated response time.
 *
 * Status: submitted → providers_notified
 * Role: Customer only
 */
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SERVICE_ORDER_STATUS_META } from "@/types/service-order";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RequestSentScreen() {
  const router = useRouter();
  const colors = useThemeColor();
  const params = useLocalSearchParams<{
    bookingId?: string;
    serviceName?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    address?: string;
  }>();

  // Animated check mark
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const statusMeta = SERVICE_ORDER_STATUS_META.providers_notified;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Animated success icon */}
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: statusMeta.bgColor,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={72}
            color={statusMeta.color}
          />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Yêu cầu đã được gửi!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Hệ thống đang gửi yêu cầu đến thợ khu vực gần bạn.{"\n"}
            Thợ sẽ phản hồi trong vòng 5-15 phút.
          </Text>

          {/* Order summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            {params.serviceName && (
              <SummaryRow
                icon="construct-outline"
                label="Dịch vụ"
                value={params.serviceName}
                colors={colors}
              />
            )}
            {params.address && (
              <SummaryRow
                icon="location-outline"
                label="Địa điểm"
                value={params.address}
                colors={colors}
              />
            )}
            {params.scheduledDate && (
              <SummaryRow
                icon="calendar-outline"
                label="Lịch hẹn"
                value={`${params.scheduledDate}${params.scheduledTime ? ` • ${params.scheduledTime}` : ""}`}
                colors={colors}
              />
            )}
            {params.bookingId && (
              <SummaryRow
                icon="document-outline"
                label="Mã yêu cầu"
                value={`#${params.bookingId}`}
                colors={colors}
              />
            )}
          </View>

          {/* Info box */}
          <View style={[styles.infoBox, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#1976D2"
            />
            <Text style={styles.infoText}>
              Bạn sẽ nhận thông báo khi có thợ phản hồi. Bạn có thể theo dõi
              trạng thái bất kỳ lúc nào.
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* CTA buttons */}
      <View style={styles.footer}>
        <Button
          title="Theo dõi yêu cầu"
          onPress={() => {
            if (params.bookingId) {
              router.replace(`/service-booking/${params.bookingId}` as any);
            } else {
              router.replace("/(tabs)/activity" as any);
            }
          }}
          style={styles.primaryBtn}
        />
        <Button
          title="Quay về trang chủ"
          onPress={() => router.replace("/(tabs)" as any)}
          variant="outline"
          style={styles.secondaryBtn}
        />
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[styles.summaryValue, { color: colors.text }]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  summaryCard: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryLabel: { fontSize: 13, width: 80 },
  summaryValue: { fontSize: 14, fontWeight: "600", flex: 1 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    width: "100%",
  },
  infoText: { flex: 1, fontSize: 13, color: "#1976D2", lineHeight: 20 },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  primaryBtn: { width: "100%" },
  secondaryBtn: { width: "100%" },
});
