/**
 * HeroBanner — Full-width image-like banner with construction workers
 * Matches the large hero image in the reference design
 */
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, View } from "react-native";

const { width: SW } = Dimensions.get("window");

export function HeroBanner() {
  return (
    <View style={s.container}>
      {/* Simulated hero image with green/yellow gradient feel */}
      <View style={s.banner}>
        <View style={s.overlay}>
          <View style={s.iconRow}>
            <View style={s.workerIcon}>
              <Ionicons name="people" size={32} color="#F59E0B" />
            </View>
            <View style={s.workerIcon}>
              <Ionicons name="construct" size={32} color="#90B44C" />
            </View>
            <View style={s.workerIcon}>
              <Ionicons name="hammer" size={32} color="#F59E0B" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  banner: {
    width: "100%",
    height: SW * 0.45,
    borderRadius: 16,
    backgroundColor: "#E8F0D8",
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(144, 180, 76, 0.08)",
  },
  iconRow: {
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
  },
  workerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});
