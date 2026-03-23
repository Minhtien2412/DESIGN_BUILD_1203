/**
 * CategoryIconGrid — 4-column image+label grid used for service/equipment/design icons
 */
import { Href, router } from "expo-router";
import { memo } from "react";
import {
    Dimensions,
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;

export interface GridItem {
  id: number;
  label: string;
  icon: ImageSourcePropType;
  route: string;
}

export const CategoryIconGrid = memo<{
  data: GridItem[];
  columns?: number;
}>(({ data, columns = 4 }) => {
  const cellW = (SW - PAD * 2) / columns;

  return (
    <View style={styles.container}>
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.cell, { width: cellW }]}
          onPress={() => router.push(item.route as Href)}
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
    marginBottom: 16,
  },
  box: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    overflow: "hidden",
    backgroundColor: "#FAFAFA",
  },
  img: { width: 42, height: 42 },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 14,
    maxWidth: 74,
  },
});
