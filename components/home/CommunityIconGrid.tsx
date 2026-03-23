/**
 * CommunityIconGrid — 3-column Ionicons grid for community section
 */
import { CommunityItem } from "@/data/home-data";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { memo } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;

export const CommunityIconGrid = memo<{ data: CommunityItem[] }>(({ data }) => {
  const cellW = (SW - PAD * 2) / 3;

  return (
    <View style={styles.container}>
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.cell, { width: cellW }]}
          onPress={() => router.push(item.route as Href)}
          activeOpacity={0.7}
        >
          <View style={[styles.box, { backgroundColor: item.bgColor }]}>
            <Ionicons
              name={item.iconName as any}
              size={26}
              color={item.iconColor}
            />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
  },
  cell: {
    alignItems: "center",
    marginBottom: 14,
  },
  box: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    lineHeight: 13,
    maxWidth: 72,
  },
});
