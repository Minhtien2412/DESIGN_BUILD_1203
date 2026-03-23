/**
 * PromoBanner — Horizontal scrolling banner carousel
 *
 * @created 2026-03-21
 */

import { ROLE_THEME } from "@/constants/roleTheme";
import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const BANNER_WIDTH = SW - 40;
const BANNER_HEIGHT = 140;

interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  ctaLabel: string;
}

interface Props {
  banners: BannerData[];
  onPress?: (banner: BannerData) => void;
}

export function PromoBanner({ banners, onPress }: Props) {
  const renderItem = ({ item }: { item: BannerData }) => (
    <TouchableOpacity
      style={[s.banner, { backgroundColor: item.bgColor }]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.85}
    >
      <View style={s.bannerContent}>
        <Text style={[s.bannerTitle, { color: item.textColor }]}>
          {item.title}
        </Text>
        <Text style={[s.bannerSubtitle, { color: item.textColor + "CC" }]}>
          {item.subtitle}
        </Text>
        <View style={s.ctaRow}>
          <Text style={[s.ctaText, { color: item.textColor }]}>
            {item.ctaLabel}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={item.textColor} />
        </View>
      </View>
      <View style={s.bannerDeco}>
        <View
          style={[s.decoCircle, { backgroundColor: item.textColor + "15" }]}
        />
        <View
          style={[s.decoCircle2, { backgroundColor: item.textColor + "10" }]}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={banners}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      snapToInterval={BANNER_WIDTH + 12}
      decelerationRate="fast"
      contentContainerStyle={s.listContent}
    />
  );
}

const s = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: ROLE_THEME.radius.xl,
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: ROLE_THEME.fontSize.xl,
    fontWeight: "700",
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: ROLE_THEME.fontSize.sm,
    lineHeight: 18,
    marginBottom: 12,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ctaText: {
    fontSize: ROLE_THEME.fontSize.md,
    fontWeight: "600",
  },
  bannerDeco: {
    position: "absolute",
    right: -20,
    top: -20,
  },
  decoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  decoCircle2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: "absolute",
    right: 20,
    bottom: -30,
  },
});
