/**
 * CategoryTagRow — Horizontal category chip tags
 */
import { CATEGORY_ITEMS } from "@/data/home-data";
import { Href, router } from "expo-router";
import { memo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

const PAD = 16;

export const CategoryTagRow = memo(() => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  >
    {CATEGORY_ITEMS.slice(0, 4).map((item) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => router.push(item.route as Href)}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{item.label}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
));

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: PAD,
    gap: 20,
    marginTop: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
});
