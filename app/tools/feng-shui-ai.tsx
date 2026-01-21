/**
 * Phong Thủy AI - Tra cứu hướng nhà theo tuổi với AI
 * Tính năng: Xem tuổi, xem hướng, tư vấn phong thủy bằng ChatGPT AI
 * Tích hợp ChatGPT API để trả lời câu hỏi phong thủy
 * @author AI Assistant
 * @date 14/01/2026
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatGPTMessage } from "@/services/api/chatGPTService";
import fengShuiService, {
    CoupleCompatibility,
    FengShuiPerson,
    FengShuiResult,
    HouseAnalysis,
    consultFengShuiAI,
} from "@/services/fengShuiService";

const { width } = Dimensions.get("window");

// ==================== TYPES ====================

type TabType = "lookup" | "direction" | "couple" | "consult";

interface AIMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

// ==================== COLORS ====================

const ELEMENT_COLORS: Record<
  string,
  { primary: string; secondary: string; gradient: [string, string] }
> = {
  Kim: {
    primary: "#FFD700",
    secondary: "#FFA500",
    gradient: ["#FFD700", "#FFA500"],
  },
  Mộc: {
    primary: "#228B22",
    secondary: "#32CD32",
    gradient: ["#228B22", "#32CD32"],
  },
  Thủy: {
    primary: "#1E90FF",
    secondary: "#00CED1",
    gradient: ["#1E90FF", "#00CED1"],
  },
  Hỏa: {
    primary: "#FF4500",
    secondary: "#FF6347",
    gradient: ["#FF4500", "#FF6347"],
  },
  Thổ: {
    primary: "#8B4513",
    secondary: "#D2691E",
    gradient: ["#8B4513", "#D2691E"],
  },
};

const ELEMENT_ICONS: Record<string, string> = {
  Kim: "🪙",
  Mộc: "🌳",
  Thủy: "💧",
  Hỏa: "🔥",
  Thổ: "🏔️",
};

const DIRECTION_ICONS: Record<string, string> = {
  Bắc: "⬆️",
  Nam: "⬇️",
  Đông: "➡️",
  Tây: "⬅️",
  "Đông Bắc": "↗️",
  "Đông Nam": "↘️",
  "Tây Bắc": "↖️",
  "Tây Nam": "↙️",
};

// ==================== MAIN COMPONENT ====================

export default function FengShuiAIScreen() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>("lookup");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [result, setResult] = useState<FengShuiResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Direction analysis
  const [selectedDirection, setSelectedDirection] = useState("");
  const [houseAnalysis, setHouseAnalysis] = useState<HouseAnalysis | null>(
    null
  );

  // Couple compatibility
  const [partner, setPartner] = useState({
    year: "",
    gender: "female" as "male" | "female",
  });
  const [coupleResult, setCoupleResult] = useState<CoupleCompatibility | null>(
    null
  );

  // AI consultation
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animations
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withSpring(1.05), withSpring(1)),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // ==================== HANDLERS ====================

  const handleCalculate = useCallback(() => {
    const year = parseInt(birthYear);
    if (isNaN(year) || year < 1900 || year > 2100) {
      Alert.alert("Lỗi", "Vui lòng nhập năm sinh hợp lệ (1900-2100)");
      return;
    }

    setLoading(true);
    try {
      const person: FengShuiPerson = { birthYear: year, gender };
      const calcResult = fengShuiService.calculateFengShui(person);
      setResult(calcResult);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tính toán phong thủy");
    } finally {
      setLoading(false);
    }
  }, [birthYear, gender]);

  const handleAnalyzeDirection = useCallback(() => {
    if (!result || !selectedDirection) {
      Alert.alert("Thông báo", "Vui lòng chọn hướng nhà cần phân tích");
      return;
    }

    const analysis = fengShuiService.analyzeHouseDirection(
      result,
      selectedDirection
    );
    setHouseAnalysis(analysis);
  }, [result, selectedDirection]);

  const handleCheckCouple = useCallback(() => {
    const year1 = parseInt(birthYear);
    const year2 = parseInt(partner.year);

    if (isNaN(year1) || isNaN(year2)) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ năm sinh của cả hai người");
      return;
    }

    setLoading(true);
    try {
      const person1: FengShuiPerson = { birthYear: year1, gender };
      const person2: FengShuiPerson = {
        birthYear: year2,
        gender: partner.gender,
      };
      const compatibility = fengShuiService.calculateCoupleCompatibility(
        person1,
        person2
      );
      setCoupleResult(compatibility);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tính hợp tuổi");
    } finally {
      setLoading(false);
    }
  }, [birthYear, gender, partner]);

  // Chuyển đổi messages sang định dạng ChatGPT để duy trì ngữ cảnh hội thoại
  const getConversationHistory = useCallback((): ChatGPTMessage[] => {
    return messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAiLoading(true);

    try {
      const year = parseInt(birthYear);
      const personInfo = !isNaN(year) ? { birthYear: year, gender } : undefined;

      // Lấy lịch sử hội thoại để duy trì ngữ cảnh
      const history = getConversationHistory();

      // Gọi ChatGPT API với lịch sử hội thoại
      const response = await consultFengShuiAI(
        userMessage.content,
        personInfo,
        undefined,
        history.length > 0 ? history : undefined
      );

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("[FengShuiAI] Error sending message:", error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          "❌ Xin lỗi, đã có lỗi xảy ra khi kết nối với ChatGPT. Vui lòng kiểm tra kết nối mạng và thử lại sau.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  }, [inputText, birthYear, gender, getConversationHistory]);

  // Hàm xóa lịch sử chat
  const handleClearChat = useCallback(() => {
    Alert.alert(
      "Xóa cuộc trò chuyện",
      "Bạn có chắc muốn xóa toàn bộ lịch sử chat?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => setMessages([]),
        },
      ]
    );
  }, []);

  const handleQuickQuestion = useCallback((question: string) => {
    setInputText(question);
  }, []);

  // ==================== RENDER FUNCTIONS ====================

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { key: "lookup" as TabType, label: "Tra Cứu", icon: "search" },
        { key: "direction" as TabType, label: "Hướng Nhà", icon: "compass" },
        { key: "couple" as TabType, label: "Hợp Tuổi", icon: "heart" },
        { key: "consult" as TabType, label: "Tư Vấn AI", icon: "sparkles" },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={activeTab === tab.key ? "#fff" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInputSection = () => (
    <Animated.View
      entering={FadeInUp.duration(300)}
      style={styles.inputSection}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inputGradient}
      >
        <Text style={styles.inputTitle}>☯️ Nhập Thông Tin</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Năm sinh</Text>
            <TextInput
              style={styles.input}
              value={birthYear}
              onChangeText={setBirthYear}
              placeholder="VD: 1990"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Giới tính</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  gender === "male" && styles.genderBtnActive,
                ]}
                onPress={() => setGender("male")}
              >
                <Text
                  style={[
                    styles.genderBtnText,
                    gender === "male" && styles.genderBtnTextActive,
                  ]}
                >
                  👨 Nam
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  gender === "female" && styles.genderBtnActive,
                ]}
                onPress={() => setGender("female")}
              >
                <Text
                  style={[
                    styles.genderBtnText,
                    gender === "female" && styles.genderBtnTextActive,
                  ]}
                >
                  👩 Nữ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.calculateBtn}
          onPress={handleCalculate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="calculator" size={20} color="#fff" />
              <Text style={styles.calculateBtnText}>Tra Cứu Ngay</Text>
            </>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const renderLookupResult = () => {
    if (!result) return null;

    const colors = ELEMENT_COLORS[result.element] || ELEMENT_COLORS["Thổ"];

    return (
      <Animated.View
        entering={FadeIn.duration(500)}
        style={styles.resultContainer}
      >
        {/* Main Info Card */}
        <LinearGradient
          colors={colors.gradient}
          style={styles.mainInfoCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.mainInfoHeader}>
            <Animated.Text style={[styles.elementIcon, animatedStyle]}>
              {ELEMENT_ICONS[result.element]}
            </Animated.Text>
            <View style={styles.mainInfoText}>
              <Text style={styles.canChiText}>{result.canChi}</Text>
              <Text style={styles.mainZodiacText}>{result.zodiac}</Text>
            </View>
          </View>

          <View style={styles.mainInfoRow}>
            <View style={styles.mainInfoItem}>
              <Text style={styles.mainInfoLabel}>Mệnh</Text>
              <Text style={styles.mainInfoValue}>{result.element}</Text>
            </View>
            <View style={styles.mainInfoItem}>
              <Text style={styles.mainInfoLabel}>Nạp Âm</Text>
              <Text style={styles.mainInfoValue}>{result.napAm}</Text>
            </View>
            <View style={styles.mainInfoItem}>
              <Text style={styles.mainInfoLabel}>Cung</Text>
              <Text style={styles.mainInfoValue}>{result.cungMenh}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Lucky Directions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>✨ Hướng Tốt</Text>
          <View style={styles.directionsGrid}>
            {result.luckyDirections.map((dir, index) => (
              <View
                key={index}
                style={[styles.directionItem, styles.luckyDirection]}
              >
                <Text style={styles.directionIcon}>
                  {DIRECTION_ICONS[dir.direction]}
                </Text>
                <Text style={styles.directionName}>{dir.direction}</Text>
                <Text style={styles.directionMeaning}>{dir.name}</Text>
                <View style={styles.ratingStars}>
                  {[...Array(dir.rating)].map((_, i) => (
                    <Text key={i} style={styles.star}>
                      ⭐
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Unlucky Directions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚠️ Hướng Xấu</Text>
          <View style={styles.directionsGrid}>
            {result.unluckyDirections.map((dir, index) => (
              <View
                key={index}
                style={[styles.directionItem, styles.unluckyDirection]}
              >
                <Text style={styles.directionIcon}>
                  {DIRECTION_ICONS[dir.direction]}
                </Text>
                <Text style={styles.directionName}>{dir.direction}</Text>
                <Text style={styles.directionMeaning}>{dir.name}</Text>
                <Text style={styles.usageHint}>{dir.usage[0]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Lucky Colors */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎨 Màu Sắc May Mắn</Text>
          <View style={styles.colorRow}>
            {result.luckyColors.map((color, index) => (
              <View key={index} style={styles.colorChip}>
                <Text style={styles.colorText}>{color}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Lucky Numbers */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🔢 Số May Mắn</Text>
          <View style={styles.numberRow}>
            {result.luckyNumbers.map((num, index) => (
              <View key={index} style={styles.numberChip}>
                <Text style={styles.numberText}>{num}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Lucky Items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏆 Vật Phẩm Phong Thủy</Text>
          <View style={styles.itemsGrid}>
            {result.luckyItems.map((item, index) => (
              <View key={index} style={styles.itemChip}>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Compatible Zodiacs */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🤝 Tuổi Hợp</Text>
          <View style={styles.zodiacRow}>
            {result.compatibleZodiacs.map((z, index) => (
              <View key={index} style={[styles.zodiacChip, styles.goodZodiac]}>
                <Text style={styles.zodiacText}>{z}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
            💔 Tuổi Kỵ
          </Text>
          <View style={styles.zodiacRow}>
            {result.incompatibleZodiacs.map((z, index) => (
              <View key={index} style={[styles.zodiacChip, styles.badZodiac]}>
                <Text style={styles.zodiacText}>{z}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderDirectionTab = () => (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.directionContainer}
    >
      {!result && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🧭</Text>
          <Text style={styles.emptyText}>
            Vui lòng tra cứu tuổi trước để xem phân tích hướng nhà
          </Text>
          <TouchableOpacity
            style={styles.goToLookupBtn}
            onPress={() => setActiveTab("lookup")}
          >
            <Text style={styles.goToLookupText}>Tra cứu ngay</Text>
          </TouchableOpacity>
        </View>
      )}

      {result && (
        <>
          <View style={styles.directionPicker}>
            <Text style={styles.directionPickerTitle}>
              Chọn hướng nhà của bạn:
            </Text>
            <View style={styles.compassContainer}>
              {Object.entries(DIRECTION_ICONS).map(([direction, icon]) => (
                <TouchableOpacity
                  key={direction}
                  style={[
                    styles.compassDirection,
                    selectedDirection === direction &&
                      styles.compassDirectionActive,
                  ]}
                  onPress={() => setSelectedDirection(direction)}
                >
                  <Text style={styles.compassIcon}>{icon}</Text>
                  <Text style={styles.compassLabel}>{direction}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.analyzeBtn,
                !selectedDirection && styles.analyzeBtnDisabled,
              ]}
              onPress={handleAnalyzeDirection}
              disabled={!selectedDirection}
            >
              <Ionicons name="analytics" size={20} color="#fff" />
              <Text style={styles.analyzeBtnText}>Phân Tích Hướng</Text>
            </TouchableOpacity>
          </View>

          {houseAnalysis && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              style={styles.analysisResult}
            >
              <View
                style={[
                  styles.scoreCard,
                  houseAnalysis.compatibility === "excellent" &&
                    styles.excellentScore,
                  houseAnalysis.compatibility === "good" && styles.goodScore,
                  houseAnalysis.compatibility === "neutral" &&
                    styles.neutralScore,
                  houseAnalysis.compatibility === "bad" && styles.badScore,
                  houseAnalysis.compatibility === "very_bad" &&
                    styles.veryBadScore,
                ]}
              >
                <Text style={styles.scoreValue}>{houseAnalysis.score}</Text>
                <Text style={styles.scoreLabel}>điểm</Text>
              </View>

              <Text style={styles.analysisText}>{houseAnalysis.analysis}</Text>

              <View style={styles.suggestionsCard}>
                <Text style={styles.suggestionsTitle}>💡 Gợi ý:</Text>
                {houseAnalysis.suggestions.map((s, i) => (
                  <Text key={i} style={styles.suggestionItem}>
                    • {s}
                  </Text>
                ))}
              </View>

              <View style={styles.roomPlacementsCard}>
                <Text style={styles.roomPlacementsTitle}>
                  🏠 Bố trí phòng tối ưu:
                </Text>
                {houseAnalysis.roomPlacements.map((room, i) => (
                  <View key={i} style={styles.roomItem}>
                    <Text style={styles.roomName}>{room.room}</Text>
                    <Text style={styles.roomDirection}>
                      Hướng {room.suggestedDirection}
                    </Text>
                    <Text style={styles.roomReason}>{room.reason}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </>
      )}
    </Animated.View>
  );

  const renderCoupleTab = () => (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.coupleContainer}
    >
      {!result && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💑</Text>
          <Text style={styles.emptyText}>
            Vui lòng tra cứu tuổi của bạn trước
          </Text>
          <TouchableOpacity
            style={styles.goToLookupBtn}
            onPress={() => setActiveTab("lookup")}
          >
            <Text style={styles.goToLookupText}>Tra cứu ngay</Text>
          </TouchableOpacity>
        </View>
      )}

      {result && (
        <>
          <View style={styles.coupleInput}>
            <LinearGradient
              colors={["#ff758c", "#ff7eb3"]}
              style={styles.partnerCard}
            >
              <Text style={styles.partnerTitle}>💕 Thông tin đối phương</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabelWhite}>Năm sinh</Text>
                  <TextInput
                    style={styles.inputWhite}
                    value={partner.year}
                    onChangeText={(text) =>
                      setPartner((p) => ({ ...p, year: text }))
                    }
                    placeholder="VD: 1992"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabelWhite}>Giới tính</Text>
                  <View style={styles.genderButtons}>
                    <TouchableOpacity
                      style={[
                        styles.genderBtnWhite,
                        partner.gender === "male" &&
                          styles.genderBtnWhiteActive,
                      ]}
                      onPress={() =>
                        setPartner((p) => ({ ...p, gender: "male" }))
                      }
                    >
                      <Text style={styles.genderBtnWhiteText}>👨</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderBtnWhite,
                        partner.gender === "female" &&
                          styles.genderBtnWhiteActive,
                      ]}
                      onPress={() =>
                        setPartner((p) => ({ ...p, gender: "female" }))
                      }
                    >
                      <Text style={styles.genderBtnWhiteText}>👩</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkCoupleBtn}
                onPress={handleCheckCouple}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ff758c" />
                ) : (
                  <>
                    <Ionicons name="heart" size={20} color="#ff758c" />
                    <Text style={styles.checkCoupleBtnText}>Xem Hợp Tuổi</Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {coupleResult && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              style={styles.coupleResult}
            >
              <View style={styles.coupleScoreCard}>
                <View style={styles.coupleScoreCircle}>
                  <Text style={styles.coupleScoreValue}>
                    {coupleResult.overallScore}
                  </Text>
                  <Text style={styles.coupleScoreLabel}>điểm</Text>
                </View>
                <Text style={styles.coupleAnalysis}>
                  {coupleResult.analysis}
                </Text>
              </View>

              <View style={styles.compatibilityBars}>
                <View style={styles.compatBar}>
                  <Text style={styles.compatBarLabel}>Ngũ hành</Text>
                  <View style={styles.compatBarTrack}>
                    <View
                      style={[
                        styles.compatBarFill,
                        { width: `${coupleResult.elementCompatibility}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.compatBarValue}>
                    {coupleResult.elementCompatibility}%
                  </Text>
                </View>

                <View style={styles.compatBar}>
                  <Text style={styles.compatBarLabel}>Con giáp</Text>
                  <View style={styles.compatBarTrack}>
                    <View
                      style={[
                        styles.compatBarFill,
                        { width: `${coupleResult.zodiacCompatibility}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.compatBarValue}>
                    {coupleResult.zodiacCompatibility}%
                  </Text>
                </View>

                <View style={styles.compatBar}>
                  <Text style={styles.compatBarLabel}>Cung mệnh</Text>
                  <View style={styles.compatBarTrack}>
                    <View
                      style={[
                        styles.compatBarFill,
                        { width: `${coupleResult.cungMenhCompatibility}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.compatBarValue}>
                    {coupleResult.cungMenhCompatibility}%
                  </Text>
                </View>
              </View>

              {coupleResult.strengths.length > 0 && (
                <View style={styles.strengthsCard}>
                  <Text style={styles.strengthsTitle}>💪 Điểm mạnh:</Text>
                  {coupleResult.strengths.map((s, i) => (
                    <Text key={i} style={styles.strengthItem}>
                      ✓ {s}
                    </Text>
                  ))}
                </View>
              )}

              {coupleResult.challenges.length > 0 && (
                <View style={styles.challengesCard}>
                  <Text style={styles.challengesTitle}>⚡ Thử thách:</Text>
                  {coupleResult.challenges.map((c, i) => (
                    <Text key={i} style={styles.challengeItem}>
                      ! {c}
                    </Text>
                  ))}
                </View>
              )}

              {coupleResult.advice.length > 0 && (
                <View style={styles.adviceCard}>
                  <Text style={styles.adviceTitle}>💡 Lời khuyên:</Text>
                  {coupleResult.advice.map((a, i) => (
                    <Text key={i} style={styles.adviceItem}>
                      • {a}
                    </Text>
                  ))}
                </View>
              )}
            </Animated.View>
          )}
        </>
      )}
    </Animated.View>
  );

  const renderConsultTab = () => (
    <View style={styles.consultContainer}>
      {/* Chat Header với nút xóa */}
      {messages.length > 0 && (
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderLeft}>
            <Text style={styles.chatHeaderIcon}>🤖</Text>
            <Text style={styles.chatHeaderText}>
              ChatGPT - Chuyên gia Phong Thủy
            </Text>
          </View>
          <TouchableOpacity
            style={styles.clearChatBtn}
            onPress={handleClearChat}
          >
            <Ionicons name="trash-outline" size={18} color="#ff4757" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.chatMessages}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 && (
            <View style={styles.welcomeMessage}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.welcomeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.welcomeIcon}>🧙‍♂️</Text>
                <Text style={styles.welcomeTitle}>Tư Vấn Phong Thủy AI</Text>
                <Text style={styles.welcomeSubtitle}>Powered by ChatGPT</Text>
              </LinearGradient>

              <Text style={styles.welcomeText}>
                Hãy hỏi bất kỳ câu hỏi nào về phong thủy, tôi sẽ tư vấn cho bạn!
                {"\n"}💡 Nhập năm sinh ở tab "Tra Cứu" để nhận tư vấn cá nhân
                hóa.
              </Text>

              <Text style={styles.quickQuestionsTitle}>📌 Câu hỏi gợi ý:</Text>
              {[
                "Làm sao để hóa giải hướng nhà xấu?",
                "Nên đặt bàn thờ ở hướng nào?",
                "Cây phong thủy nào phù hợp với mệnh tôi?",
                "Cách bố trí phòng ngủ theo phong thủy?",
                "Màu sơn nhà nào tốt cho năm nay?",
                "Tính tam hợp lục hợp trong phong thủy?",
                "Chọn ngày tốt để động thổ xây nhà?",
              ].map((q, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickQuestionBtn}
                  onPress={() => handleQuickQuestion(q)}
                >
                  <Text style={styles.quickQuestionText}>{q}</Text>
                  <Ionicons name="arrow-forward" size={14} color="#667eea" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {messages.map((msg) => (
            <Animated.View
              key={msg.id}
              entering={FadeInUp.duration(300)}
              style={[
                styles.messageContainer,
                msg.role === "user" ? styles.userMessage : styles.aiMessage,
              ]}
            >
              {msg.role === "ai" && (
                <View style={styles.aiAvatarContainer}>
                  <Text style={styles.aiAvatar}>🧙‍♂️</Text>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.role === "user" ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.role === "user" && styles.userMessageText,
                  ]}
                >
                  {msg.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    msg.role === "user" && styles.userMessageTime,
                  ]}
                >
                  {msg.timestamp.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </Animated.View>
          ))}

          {aiLoading && (
            <View style={styles.loadingMessage}>
              <View style={styles.aiAvatarContainer}>
                <Text style={styles.aiAvatar}>🧙‍♂️</Text>
              </View>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.loadingText}>ChatGPT đang suy nghĩ...</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Hỏi về phong thủy..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || aiLoading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ==================== MAIN RENDER ====================

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>☯️ Phong Thủy AI</Text>
        <View style={styles.headerRight} />
      </View>

      {renderTabs()}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        {activeTab === "lookup" && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderInputSection()}
            {renderLookupResult()}
          </ScrollView>
        )}

        {activeTab === "direction" && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderDirectionTab()}
          </ScrollView>
        )}

        {activeTab === "couple" && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderCoupleTab()}
          </ScrollView>
        )}

        {activeTab === "consult" && renderConsultTab()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: "#667eea",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // Input Section
  inputSection: {
    marginBottom: 16,
  },
  inputGradient: {
    borderRadius: 16,
    padding: 20,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  inputLabelWhite: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
  },
  inputWhite: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  genderButtons: {
    flexDirection: "row",
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  genderBtnActive: {
    backgroundColor: "#fff",
    borderColor: "#667eea",
  },
  genderBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  genderBtnTextActive: {
    color: "#667eea",
  },
  genderBtnWhite: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  genderBtnWhiteActive: {
    backgroundColor: "#fff",
  },
  genderBtnWhiteText: {
    fontSize: 18,
  },
  calculateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  calculateBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // Result Container
  resultContainer: {
    gap: 16,
  },
  mainInfoCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  mainInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  elementIcon: {
    fontSize: 60,
  },
  mainInfoText: {
    alignItems: "flex-start",
  },
  canChiText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  mainZodiacText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  mainInfoRow: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
    justifyContent: "space-around",
  },
  mainInfoItem: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
  },
  mainInfoLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  mainInfoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // Section Card
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  // Directions Grid
  directionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  directionItem: {
    width: (width - 64 - 30) / 4,
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
  },
  luckyDirection: {
    backgroundColor: "#e8f5e9",
  },
  unluckyDirection: {
    backgroundColor: "#ffebee",
  },
  directionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  directionName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  directionMeaning: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  ratingStars: {
    flexDirection: "row",
    marginTop: 4,
  },
  star: {
    fontSize: 8,
  },
  usageHint: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    marginTop: 2,
  },

  // Colors
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorChip: {
    backgroundColor: "#667eea",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  colorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },

  // Numbers
  numberRow: {
    flexDirection: "row",
    gap: 10,
  },
  numberChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  // Items
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  itemChip: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 13,
    color: "#333",
  },

  // Zodiacs
  zodiacRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  zodiacChip: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  goodZodiac: {
    backgroundColor: "#4CAF50",
  },
  badZodiac: {
    backgroundColor: "#f44336",
  },
  zodiacText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // Direction Tab
  directionContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  goToLookupBtn: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  goToLookupText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  directionPicker: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  directionPickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  compassContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  compassDirection: {
    width: (width - 80) / 4,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  compassDirectionActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196F3",
  },
  compassIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  compassLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  analyzeBtnDisabled: {
    backgroundColor: "#ccc",
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  analysisResult: {
    gap: 16,
  },
  scoreCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
  },
  excellentScore: {
    backgroundColor: "#4CAF50",
  },
  goodScore: {
    backgroundColor: "#8BC34A",
  },
  neutralScore: {
    backgroundColor: "#FFC107",
  },
  badScore: {
    backgroundColor: "#FF9800",
  },
  veryBadScore: {
    backgroundColor: "#f44336",
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
  },
  scoreLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  suggestionsCard: {
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    padding: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e65100",
    marginBottom: 8,
  },
  suggestionItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 22,
  },
  roomPlacementsCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 16,
  },
  roomPlacementsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1565c0",
    marginBottom: 12,
  },
  roomItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  roomName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  roomDirection: {
    fontSize: 14,
    color: "#1565c0",
    fontWeight: "600",
    marginTop: 2,
  },
  roomReason: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  // Couple Tab
  coupleContainer: {
    flex: 1,
  },
  coupleInput: {
    marginBottom: 16,
  },
  partnerCard: {
    borderRadius: 16,
    padding: 20,
  },
  partnerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  checkCoupleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  checkCoupleBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ff758c",
  },
  coupleResult: {
    gap: 16,
  },
  coupleScoreCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  coupleScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ff758c",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  coupleScoreValue: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
  },
  coupleScoreLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  coupleAnalysis: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    textAlign: "center",
  },
  compatibilityBars: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  compatBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  compatBarLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  compatBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
  },
  compatBarFill: {
    height: "100%",
    backgroundColor: "#ff758c",
    borderRadius: 4,
  },
  compatBarValue: {
    width: 40,
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  strengthsCard: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 16,
  },
  strengthsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 8,
  },
  strengthItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 22,
  },
  challengesCard: {
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    padding: 16,
  },
  challengesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e65100",
    marginBottom: 8,
  },
  challengeItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 22,
  },
  adviceCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 16,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1565c0",
    marginBottom: 8,
  },
  adviceItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 22,
  },

  // Consult Tab - ChatGPT Integration
  consultContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  chatHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatHeaderIcon: {
    fontSize: 20,
  },
  chatHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  clearChatBtn: {
    padding: 8,
  },
  chatMessages: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeMessage: {
    alignItems: "center",
    paddingVertical: 10,
  },
  welcomeGradient: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  welcomeIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
  },
  quickQuestionBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickQuestionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  aiAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  aiAvatar: {
    fontSize: 24,
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    backgroundColor: "#667eea",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
  },
  userMessageText: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 10,
    color: "#999",
    marginTop: 6,
    alignSelf: "flex-end",
  },
  userMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  loadingMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  loadingText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 120,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
});
