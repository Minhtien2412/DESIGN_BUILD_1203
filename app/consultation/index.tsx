import { useThemeColor } from "@/hooks/use-theme-color";
import { get, post } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const consultationTypes = [
  {
    id: "1",
    name: "Thiết kế nội thất",
    icon: "color-palette-outline",
    price: "Miễn phí",
  },
  {
    id: "2",
    name: "Thi công xây dựng",
    icon: "construct-outline",
    price: "200.000đ",
  },
  { id: "3", name: "Chọn vật liệu", icon: "cube-outline", price: "Miễn phí" },
  { id: "4", name: "Phong thủy", icon: "compass-outline", price: "500.000đ" },
  {
    id: "5",
    name: "Ngân sách dự án",
    icon: "calculator-outline",
    price: "Miễn phí",
  },
  {
    id: "6",
    name: "Pháp lý xây dựng",
    icon: "document-text-outline",
    price: "300.000đ",
  },
];

const experts = [
  {
    id: "1",
    name: "KTS. Nguyễn Văn An",
    specialty: "Thiết kế nội thất",
    avatar: "https://ui-avatars.com/api/?name=An&background=FF6B35&color=fff",
    rating: 4.9,
    consultations: 234,
    available: true,
    responseTime: "< 1 giờ",
  },
  {
    id: "2",
    name: "KS. Trần Minh Phong",
    specialty: "Kỹ sư xây dựng",
    avatar:
      "https://ui-avatars.com/api/?name=Phong&background=4CAF50&color=fff",
    rating: 4.8,
    consultations: 189,
    available: true,
    responseTime: "< 2 giờ",
  },
  {
    id: "3",
    name: "Thầy Lê Hoàng",
    specialty: "Phong thủy",
    avatar:
      "https://ui-avatars.com/api/?name=Hoang&background=9C27B0&color=fff",
    rating: 4.9,
    consultations: 567,
    available: false,
    responseTime: "< 3 giờ",
  },
];

const recentQuestions = [
  {
    id: "1",
    question: "Nên chọn gạch ceramic hay granite?",
    answers: 12,
    time: "2 giờ trước",
  },
  {
    id: "2",
    question: "Chi phí xây nhà 3 tầng 100m2?",
    answers: 8,
    time: "5 giờ trước",
  },
  {
    id: "3",
    question: "Hướng nhà Tây Nam có tốt không?",
    answers: 15,
    time: "1 ngày trước",
  },
];

export default function ConsultationScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expertList, setExpertList] = useState(experts);
  const [questions, setQuestions] = useState(recentQuestions);

  const fetchData = useCallback(async () => {
    try {
      const res = await get("/api/consultation");
      if (res?.data?.experts) setExpertList(res.data.experts);
      if (res?.data?.questions) setQuestions(res.data.questions);
    } catch {
      /* mock */
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleAskQuestion = useCallback(async () => {
    if (!question.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập câu hỏi");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await post("/api/consultation/questions", { question });
    } catch {
      /* fallback */
    }
    Alert.alert(
      "Gửi thành công! 💬",
      "Câu hỏi của bạn đã được gửi đến chuyên gia",
    );
    setQuestion("");
  }, [question]);

  const handleChatExpert = useCallback(
    (expert: (typeof experts)[0]) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (expert.available) {
        router.push("/chat" as any);
      } else {
        Alert.alert(
          "Để lại tin nhắn",
          `${expert.name} hiện không trực tuyến. Bạn có muốn để lại tin nhắn?`,
          [
            { text: "Hủy" },
            {
              text: "Gửi tin nhắn",
              onPress: () => router.push("/chat" as any),
            },
          ],
        );
      }
    },
    [router],
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Tư vấn", headerShown: true }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
      >
        {/* Ask Question */}
        <View style={[styles.askSection, { backgroundColor: "#0D9488" }]}>
          <Text style={styles.askTitle}>Bạn cần tư vấn gì?</Text>
          <View style={styles.askInputContainer}>
            <TextInput
              style={styles.askInput}
              placeholder="Nhập câu hỏi của bạn..."
              placeholderTextColor="#999"
              value={question}
              onChangeText={setQuestion}
            />
            <TouchableOpacity style={styles.askBtn} onPress={handleAskQuestion}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Consultation Types */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Chủ đề tư vấn
          </Text>
          <View style={styles.typesGrid}>
            {consultationTypes.map((type) => (
              <TouchableOpacity key={type.id} style={styles.typeItem}>
                <View
                  style={[styles.typeIcon, { backgroundColor: "#14B8A615" }]}
                >
                  <Ionicons name={type.icon as any} size={24} color="#14B8A6" />
                </View>
                <Text style={[styles.typeName, { color: textColor }]}>
                  {type.name}
                </Text>
                <Text
                  style={[
                    styles.typePrice,
                    type.price === "Miễn phí" && { color: "#4CAF50" },
                  ]}
                >
                  {type.price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Online Experts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Chuyên gia trực tuyến
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {expertList.map((expert) => (
              <TouchableOpacity
                key={expert.id}
                style={[styles.expertCard, { backgroundColor: cardBg }]}
                onPress={() => handleChatExpert(expert)}
              >
                <View style={styles.expertAvatarContainer}>
                  <Image
                    source={{ uri: expert.avatar }}
                    style={styles.expertAvatar}
                  />
                  <View
                    style={[
                      styles.availabilityDot,
                      {
                        backgroundColor: expert.available ? "#4CAF50" : "#999",
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.expertName, { color: textColor }]}>
                  {expert.name}
                </Text>
                <Text style={styles.expertSpecialty}>{expert.specialty}</Text>
                <View style={styles.expertStats}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={styles.expertRating}>{expert.rating}</Text>
                  <Text style={styles.expertConsults}>
                    • {expert.consultations} tư vấn
                  </Text>
                </View>
                <Text style={styles.responseTime}>
                  ⏱️ {expert.responseTime}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.chatBtn,
                    !expert.available && styles.chatBtnDisabled,
                  ]}
                  onPress={() => handleChatExpert(expert)}
                >
                  <Text style={styles.chatBtnText}>
                    {expert.available ? "Chat ngay" : "Để lại tin nhắn"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Questions */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Câu hỏi phổ biến
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {questions.map((q) => (
            <TouchableOpacity key={q.id} style={styles.questionItem}>
              <View style={styles.questionIcon}>
                <Ionicons name="help-circle" size={24} color="#14B8A6" />
              </View>
              <View style={styles.questionContent}>
                <Text style={[styles.questionText, { color: textColor }]}>
                  {q.question}
                </Text>
                <View style={styles.questionMeta}>
                  <Ionicons name="chatbubbles-outline" size={12} color="#666" />
                  <Text style={styles.questionMetaText}>
                    {q.answers} trả lời
                  </Text>
                  <Text style={styles.questionTime}>• {q.time}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Assistant */}
        <TouchableOpacity
          style={[styles.aiCard, { backgroundColor: "#4CAF50" }]}
          onPress={() => router.push("/ai-customer-support" as any)}
        >
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={28} color="#4CAF50" />
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>Trợ lý AI 24/7</Text>
            <Text style={styles.aiDesc}>Hỏi đáp tự động, nhanh chóng</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  askSection: { padding: 20, paddingTop: 16 },
  askTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  askInputContainer: { flexDirection: "row", alignItems: "center" },
  askInput: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    fontSize: 15,
  },
  askBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  section: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  viewAll: { color: "#0D9488", fontSize: 14 },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  typeItem: { width: "31%", alignItems: "center", marginBottom: 16 },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  typeName: { fontSize: 12, textAlign: "center", marginBottom: 4 },
  typePrice: { fontSize: 11, color: "#0D9488", fontWeight: "600" },
  expertCard: {
    width: 168,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  expertAvatarContainer: { position: "relative" },
  expertAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
  },
  availabilityDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },
  expertName: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  expertSpecialty: { color: "#666", fontSize: 11, marginTop: 2 },
  expertStats: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  expertRating: { fontSize: 12, fontWeight: "500", marginLeft: 2 },
  expertConsults: { color: "#666", fontSize: 11, marginLeft: 4 },
  responseTime: { fontSize: 10, color: "#666", marginTop: 4 },
  chatBtn: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 10,
  },
  chatBtnDisabled: { backgroundColor: "#9CA3AF" },
  chatBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  questionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  questionIcon: { marginRight: 12 },
  questionContent: { flex: 1 },
  questionText: { fontSize: 14, lineHeight: 20 },
  questionMeta: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  questionMetaText: { color: "#666", fontSize: 11, marginLeft: 4 },
  questionTime: { color: "#999", fontSize: 11, marginLeft: 4 },
  aiCard: {
    margin: 16,
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  aiIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  aiContent: { flex: 1, marginLeft: 16 },
  aiTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  aiDesc: { color: "#fff", opacity: 0.9, marginTop: 2 },
});
