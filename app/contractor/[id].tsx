import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function ContractorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColor();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Chi tiết nhà thầu",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Ionicons name="construct-outline" size={48} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Nhà thầu #{id}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Thông tin chi tiết nhà thầu đang được cập nhật.
          </Text>
          <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} />
        </View>

        <Pressable
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.backBtnText}>Quay lại danh sách</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, alignItems: "center", paddingTop: 40 },
  card: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: "700", marginTop: 16 },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
  },
  backBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
