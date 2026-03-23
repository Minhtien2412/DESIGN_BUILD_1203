/**
 * SectionTitle — Section header with title + optional search pill or "see more" link
 */
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PAD = 16;

export interface SectionTitleProps {
  title: string;
  searchHint?: string;
  seeMore?: string;
  seeMoreLabel?: string;
}

export const SectionTitle = memo<SectionTitleProps>(
  ({ title, searchHint, seeMore, seeMoreLabel }) => (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
      </View>
      {searchHint ? (
        <TouchableOpacity
          style={styles.searchPill}
          onPress={() => router.push("/search" as Href)}
          activeOpacity={0.7}
        >
          <Text style={styles.hintText} numberOfLines={1}>
            {searchHint}
          </Text>
          <Ionicons name="search-outline" size={10} color="#999" />
        </TouchableOpacity>
      ) : seeMore ? (
        <TouchableOpacity
          onPress={() => router.push(seeMore as Href)}
          hitSlop={8}
          style={styles.seeMoreBtn}
        >
          <Text style={styles.seeMoreText}>{seeMoreLabel || "XEM THÊM"}</Text>
          <Ionicons name="chevron-forward" size={12} color="#161616" />
        </TouchableOpacity>
      ) : null}
    </View>
  ),
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PAD,
    marginTop: 22,
    marginBottom: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },
  searchPill: {
    flex: 1,
    maxWidth: 230,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#D9D9D9",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  hintText: {
    fontSize: 9,
    fontStyle: "italic",
    color: "rgba(0,0,0,0.7)",
    flex: 1,
    marginRight: 6,
  },
  seeMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeMoreText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0D9488",
    letterSpacing: 0.3,
  },
});
