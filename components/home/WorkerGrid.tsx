/**
 * WorkerGrid — 4-column icon+label grid for WorkerItem[] with booking navigation
 */
import { WorkerItem } from "@/data/home-data";
import { Href, router } from "expo-router";
import { memo, useCallback } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;

export const WorkerGrid = memo<{ data: WorkerItem[] }>(({ data }) => {
  const cellW = (SW - PAD * 2) / 4;

  const onWorkerPress = useCallback((item: WorkerItem) => {
    // Non-worker items (materials, equipment, etc.) navigate directly
    if (!item.route.includes("specialty=")) {
      router.push(item.route as Href);
      return;
    }
    // Navigate to booking flow with worker's specialty pre-selected
    const serviceId =
      item.route.split("specialty=")[1] ||
      item.label.toLowerCase().replace(/\s+/g, "-");
    router.push({
      pathname: "/booking/search-service",
      params: { preselect: serviceId, serviceName: item.label },
    } as Href);
  }, []);

  return (
    <View style={styles.container}>
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.cell, { width: cellW }]}
          onPress={() => onWorkerPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.box}>
            <Image source={item.icon} style={styles.img} resizeMode="contain" />
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
    borderRadius: 4,
    borderWidth: 0.3,
    borderColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  img: { width: 48, height: 48 },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    lineHeight: 13,
    maxWidth: 72,
  },
});
