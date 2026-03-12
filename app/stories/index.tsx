/**
 * Stories Index - Story feed listing
 * Route: /stories
 */

import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SAMPLE_STORIES = [
  { id: "1", user: "Kiến trúc sư A", avatar: null, hasNew: true },
  { id: "2", user: "Thợ xây B", avatar: null, hasNew: true },
  { id: "3", user: "Designer C", avatar: null, hasNew: false },
];

export default function StoriesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Stories" }} />
      <View style={styles.header}>
        <Text style={styles.title}>Câu chuyện</Text>
        <Pressable onPress={() => router.push("/stories/create")}>
          <Ionicons name="add-circle-outline" size={28} color="#0D9488" />
        </Pressable>
      </View>
      <FlatList
        data={SAMPLE_STORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.storyItem}
            onPress={() => router.push(`/stories/${item.id}`)}
          >
            <View style={[styles.avatar, item.hasNew && styles.avatarNew]}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={32} color="#94A3B8" />
              )}
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {item.user}
            </Text>
          </Pressable>
        )}
      />
      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={64} color="#CBD5E1" />
        <Text style={styles.emptyText}>Chưa có câu chuyện nào</Text>
        <Text style={styles.emptySubtext}>Chia sẻ khoảnh khắc của bạn</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1E293B" },
  list: { paddingHorizontal: 12, paddingBottom: 16 },
  storyItem: { alignItems: "center", marginHorizontal: 8, width: 72 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  avatarNew: { borderColor: "#0D9488" },
  avatarImg: { width: 60, height: 60, borderRadius: 30 },
  userName: { fontSize: 12, color: "#64748B", marginTop: 4 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 12,
  },
  emptySubtext: { fontSize: 14, color: "#CBD5E1", marginTop: 4 },
});
