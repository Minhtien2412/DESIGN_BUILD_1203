/**
 * Search Service Screen — Step 1 of booking flow
 * Customer searches and selects the service they need
 *
 * Data: API getServiceCategories() → fallback BOOKING_SERVICES
 */

import { BOOKING_SERVICES } from "@/__mocks__/booking-mocks";
import { getServiceCategories } from "@/services/servicesApi";
import { BookingService } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SearchServiceScreen() {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<BookingService[]>(BOOKING_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getServiceCategories();
        if (!cancelled && res.success && res.data?.length) {
          // Map API categories → BookingService shape for the list
          const mapped: BookingService[] = res.data.map((cat: any) => ({
            id: String(cat.id),
            name: cat.name,
            description: cat.description || cat.name,
            icon: cat.icon || "construct-outline",
            category: cat.parentName || cat.group || "Dịch vụ",
            priceRange: cat.priceRange || "",
            estimatedTime: cat.estimatedTime || "",
          }));
          setServices(mapped);
        }
      } catch {
        // Keep fallback BOOKING_SERVICES
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let items = services;
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return items;
  }, [query, services]);

  const grouped = useMemo(() => {
    const map: Record<string, BookingService[]> = {};
    filtered.forEach((s) => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return Object.entries(map);
  }, [filtered]);

  const onSelect = useCallback((service: BookingService) => {
    router.push({
      pathname: "/booking/enter-address",
      params: { serviceId: service.id, serviceName: service.name },
    } as Href);
  }, []);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Chọn dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={s.searchInput}
          placeholder="Tìm dịch vụ bạn cần..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </View>

      {/* Service list */}
      {loading && (
        <View style={s.empty}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={s.emptyText}>Đang tải dịch vụ...</Text>
        </View>
      )}
      <ScrollView
        style={s.listWrap}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {grouped.map(([category, services]) => (
          <View key={category}>
            <Text style={s.groupTitle}>{category}</Text>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={s.card}
                onPress={() => onSelect(service)}
                activeOpacity={0.7}
              >
                <View style={s.iconWrap}>
                  <Ionicons
                    name={service.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color="#0D9488"
                  />
                </View>
                <View style={s.cardContent}>
                  <Text style={s.cardTitle}>{service.name}</Text>
                  <Text style={s.cardDesc}>{service.description}</Text>
                  <View style={s.cardMeta}>
                    <View style={s.metaTag}>
                      <Ionicons name="cash-outline" size={12} color="#0D9488" />
                      <Text style={s.metaText}>{service.priceRange}</Text>
                    </View>
                    <View style={s.metaTag}>
                      <Ionicons name="time-outline" size={12} color="#0D9488" />
                      <Text style={s.metaText}>{service.estimatedTime}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="search" size={48} color="#D1D5DB" />
            <Text style={s.emptyText}>Không tìm thấy dịch vụ phù hợp</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1F2937", padding: 0 },
  listWrap: { flex: 1 },
  groupTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  cardDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  cardMeta: { flexDirection: "row", gap: 10, marginTop: 6 },
  metaTag: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 11, fontWeight: "500", color: "#0F766E" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 14, color: "#9CA3AF", marginTop: 12 },
});
