import { MODERN_COLORS } from "@/constants/modern-theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface WorkflowStep {
  id: number;
  name: string;
  status: "completed" | "current" | "pending";
  details?: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, name: "Khởi công dự án", status: "completed" },
  {
    id: 2,
    name: "Thi công ép cọc",
    status: "completed",
    details:
      "Kiểm tra cote gửi, ép cọc thử theo chỉ định thiết kế\nTổ hợp các đoạn cọc và tiến hành ép cọc",
  },
  {
    id: 3,
    name: "Thi công móng hầm",
    status: "completed",
    details:
      "CÔNG TÁC CỌC\nCÔNG TÁC BÊ TÔNG LÓT\nCÔNG TÁC XÂY COFFA GẠCH\nCÔNG TÁC CỐT THÉP MÓNG - GIẰNG MÓNG - ĐÀ KIỀNG\nCÔNG TÁC NỀN\nCÔNG TÁC CỐT THÉP SÀN",
  },
  {
    id: 4,
    name: "Thi công móng(không hầm)",
    status: "completed",
    details:
      "CÔNG TÁC ĐÀO ĐẤT VÀ ÉP (ĐÓNG) CỪ\nCÔNG TÁC CỌC VÀ BÊ TÔNG LÓT\nCÔNG TÁC XÂY COFFA GẠCH\nCÔNG TÁC CỐT THÉP MÓNG - VÀ ĐÀ KIỀNG GIẰNG\nCÔNG TÁC NỀN\nCÔNG TÁC CỐT THÉP SÀN VÁCH",
  },
  {
    id: 5,
    name: "Công tác cột bê tông",
    status: "current",
    details:
      "Thi công dựng cột, mực chân cột.\nChân cột: tạo nhám, vệ sinh.\nThi công cốt thép: chủng loại, số lượng, đường kính, khoảng cách,..\nThép râu cột: số lượng, vị  trí, khoảng cách, chiều dài.\nCao độ thép chờ: dầm thang, đà lanh tô.\nThi đóng coffa: kích thước, độ kín khít bề mặt, sơ bộ về độ thẳng đứng theo 2 phương, hệ giằng chống.\nKiểm tra vị trí tiếp giáp với các công trình lân cận.",
  },
  {
    id: 6,
    name: "Thi công dầm sàn",
    status: "pending",
    details:
      "Gửi cote trên các cột để kiểm tra\nThi công cao độ đáy dầm, sàn\nThi công thước dầm: bề rộng, chiều cao dầm.\nThi công hệ thống đỡ dầm, sàn\nThi công kích thước các ô thông tầng, ô cầu thang.\nKiểm tra độ kín khít của coffa\nTạo nhám và Vệ sinh cốt thép chờ đầu cột",
  },
  {
    id: 7,
    name: "Công tác đổ bê tông",
    status: "pending",
    details:
      "Đối với bê tông thương phẩm: kiểm tra thời gian vận chuyển và đổ bê tông, niêm chì, mác bê tông, phụ gia, độ sụt, lấy mẫu. Đối với bê tông thủ công kiểm tra cấp phối bê tông.\nCông tác đầm bê tông (tránh bê tông phân tầng).\nVị trí mạch ngừng bê tông nếu gặp sự cố\nTrong quá trình đổ bê tông phải thường xuyên kiểm tra hệ chống đỡ đà giáo coppha.\nVệ sinh khu vực thi công.",
  },
  {
    id: 8,
    name: "Công tác xây tường",
    status: "pending",
    details:
      "Tưới ẩm mặt cột, mặt sàn.\nTrét hồ dầu liên kết giữa vữa với mặt sàn, vữa với mặt cột\nVị trí chân tường toilet, ban công, sân, sân thượng, mái, phòng giặt thì xây 5 lớp gạch đinh; các vị trí còn lại xây 2 lớp gạch đinh.\nTường ≥200: xây 5 lớp gạch ống thì cuốn 1 lớp gạch đinh quay ngang.\nChiều dài thép và bê tông neo vào tường của đà lanh tô phải đảm bảo ≥200; nếu trường hợp <200 thì phải thống nhất biện pháp trước khi thi công",
  },
  {
    id: 9,
    name: "Công tác trát tường",
    status: "pending",
    details:
      "Trám hồ dầu các vị trí có bê tông, vị trí đóng lưới chống nứt.\nĐối với những mảng tường dày lớp trát >2cm trát thành 2 lần.\nSau khi hoàn thiện tường trát phải kiểm tra lại bằng thước.\nVị trí mạch ngừng phải cắt vát 45°\nTháo ghém, hoàn thiện vị trí tháo ghém.\nLắp đặt đế âm ME phải phẳng và bằng mặt tường trát.\nVệ sinh tường, khu vực thi công.\nTưới bảo dưỡng sau trát 12h; 2 lần/ngày; liên tục trong 2 ngày.",
  },
  {
    id: 10,
    name: "Thi công sơn nước",
    status: "pending",
    details:
      "Kiểm tra bề mặt tường thi công\nKiểm tra bề mặt trần thạch cao\nVệ sinh bề mặt\nKiểm tra tủ lệ pha trộn theo nhà sản xuất\nTiến hành bả matit lớp 1 sau khi trát tường tối thiểu từ 5 - 7 ngày trong điều kiện thời tiết khô ráo.",
  },
  {
    id: 11,
    name: "Thi công ốp gạch",
    status: "pending",
    details:
      "Vệ sinh, tưới ẩm tường\nKiểm tra độ ẩm của gạch\nDùng hồ dầu, keo chuyên dụng\nDùng khoen để khoét các vị trí ống chờ\nVệ sinh bề mặt, đường ron sau khi ốp (tháo ke ron)",
  },
  {
    id: 12,
    name: "Thi công lát gạch",
    status: "pending",
    details:
      "Vệ sinh, tưới ẩm nền\nKiểm tra độ ẩm của gạch (gạch men)\nDùng hồ dầu liên kết\nVệ sinh bề mặt, đường ron sau khi lát",
  },
  {
    id: 13,
    name: "Thi công trần thạch cao",
    status: "pending",
    details:
      "Bắn mực lắp V nhôm theo đúng cao độ trên tường\nKhoan bắt ty theo hệ khung, khoảng cách các ty treo\nLắp ty, hệ khung xương khoảng cách treo quy cách nhà sản xuất\nGia cố vị trí khung xương có đèn âm trần đi qua\nKiểm tra độ phẳng của hệ khung xương trước khi lắp tấm thạch cao.\nLắp tấm thạch cao\nXử lý mối nối giữa 2 tấm: đóng lưới và dán băng keo chuyên dụng",
  },
  {
    id: 14,
    name: "Thi công điện nước",
    status: "pending",
    details:
      "Thi công điện nước theo bản vẽ\nThi công các đầu bít vị trí ống chờ\nThi công vị trí van xả khí\nLưu ý: Dùng các đầu bít chuyên dụng",
  },
  {
    id: 15,
    name: "Thi công khung bao",
    status: "pending",
    details:
      "Lắp khuôn bao kết hợp với công tác xây tường\nVị trí, kích thước, cao độ, độ thẳng đứng.\nĐổ bê tông hoặc trám vữa Mác cao vị trí bát liên kết giữa khuôn bao và tường xây.\nKiểm tra lại sau khi xây tường.\nTháo kê, nêm định vị sau khi tường xây đạt cường độ ( 3 - 4 ngày).",
  },
  {
    id: 16,
    name: "Lắp khuôn bao,cánh cửa",
    status: "pending",
    details:
      "Lắp khuôn bao: vị trí, kích thước, cao độ, thẳng đứng\nKhoan bắt vít chuyên dụng, xử lý vị trí bắt vít.\nKiểm tra lại, tháo kê nêm.",
  },
  {
    id: 17,
    name: "Thi công lan can",
    status: "pending",
    details:
      "Lắp khuôn bao: vị trí, kích thước, cao độ, thẳng đứng\nKhoan bắt vít chuyên dụng, xử lý vị trí bắt vít.\nKiểm tra lại, tháo kê nêm.",
  },
  {
    id: 18,
    name: "Lắp đặt nội thất",
    status: "pending",
    details:
      "Kiểm tra vị trí, kích thước của sản phẩm và lỗ chờ MEP\nBề mặt gỗ phải phẳng, vân gỗ phải đồng nhất về chất liệu và thẩm mỹ.\nBề mặt ngoài: sơn không bụi, đồng đều về màu sắc\nBề mặt trong: sơn đồng đều về màu sắc\nKiểm tra độ kín khít vị trí tiếpgiáp\nKiểm tra thiết bị, phụ kiện hoạt động tốt\nCác vít lộ phải lắp che phủ.",
  },
  {
    id: 19,
    name: "Vệ sinh công nghiệp",
    status: "pending",
    details: "Vệ sinh công nghiệp trước khi bàn giao",
  },
  {
    id: 20,
    name: "Bàn giao nhà",
    status: "pending",
    details: "Kiểm tra bàn giao chủ đầu tư",
  },
];

export default function ProjectManagementScreen() {
  const insets = useSafeAreaInsets();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (id: number) => {
    setExpandedStep(expandedStep === id ? null : id);
  };

  // Calculate grid positions for zigzag pattern (4 columns)
  const getStepPosition = (index: number) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const isReversed = row % 2 === 1;
    const position = isReversed ? 3 - col : col;

    const stepWidth = 68;
    const stepHeight = 80;
    const startX = 55;
    const startY = 0;

    return {
      left: startX + position * stepWidth,
      top: startY + row * stepHeight,
    };
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Bar Space */}
        <View style={{ height: insets.top || 32, backgroundColor: "white" }} />

        {/* Project Title Card */}
        <View style={styles.projectTitleCard}>
          <Text style={styles.projectSubtitle}>TIẾN ĐỘ CÔNG TRÌNH</Text>
          <Text style={styles.projectTitle}>
            Biệt Thự Tân Cổ Điển KingCrown
          </Text>
        </View>

        {/* Info Boxes Row */}
        <View style={styles.infoBoxesRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>BẮT ĐẦU</Text>
            <Text style={styles.infoValue}>01/10/2025</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>DỰ KIẾN HOÀN THÀNH</Text>
            <Text style={styles.infoValue}>01/10/2025</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>THỜI GIAN</Text>
            <Text style={styles.infoValue}>92 Ngày</Text>
          </View>
        </View>

        {/* Progress Status Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Tiến độ</Text>
          <View style={styles.progressRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressCurrent}>
                <Text style={styles.progressCurrentLabel}>Hiện tại: </Text>
                <Text style={styles.progressCurrentValue}>04 </Text>
                <Text style={styles.progressCurrentName}>
                  Công tác cột bê tông
                </Text>
              </Text>
            </View>
            <Text style={styles.progressPercent}>20%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "20%" }]} />
          </View>
        </View>

        {/* Workflow Map */}
        <View style={styles.workflowContainer}>
          {WORKFLOW_STEPS.map((step, index) => {
            const pos = getStepPosition(index);
            const isExpanded = expandedStep === step.id;

            return (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.stepContainer,
                  {
                    left: pos.left,
                    top: pos.top,
                    zIndex: isExpanded ? 1000 : index,
                  },
                ]}
                onPress={() => step.details && toggleStep(step.id)}
                activeOpacity={0.7}
              >
                {/* Step Circle */}
                <View
                  style={[
                    styles.stepCircle,
                    step.status === "completed" && styles.stepCircleCompleted,
                    step.status === "current" && styles.stepCircleCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      step.status === "completed" && styles.stepNumberCompleted,
                      step.status === "current" && styles.stepNumberCurrent,
                    ]}
                  >
                    {step.id.toString().padStart(2, "0")}
                  </Text>
                </View>

                {/* Step Label */}
                <Text style={styles.stepLabel} numberOfLines={2}>
                  {step.name}
                </Text>

                {/* Expanded Details */}
                {isExpanded && step.details && (
                  <View style={styles.stepDetails}>
                    <Text style={styles.stepDetailsText}>{step.details}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Border around workflow */}
          <View style={styles.workflowBorder} />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/")}
        >
          <Ionicons name="home" size={20} color={MODERN_COLORS.gray900} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/projects")}
        >
          <Ionicons name="folder" size={20} color={MODERN_COLORS.gray900} />
          <Text style={styles.navLabel}>Lưu trữ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons
            name="dashboard"
            size={20}
            color={MODERN_COLORS.gray900}
          />
          <Text style={styles.navLabel}>Tiện ích</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(tabs)/notifications")}
        >
          <Ionicons
            name="notifications"
            size={20}
            color={MODERN_COLORS.gray900}
          />
          <Text style={styles.navLabel}>Hoạt động</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/profile")}
        >
          <View style={styles.navActiveIndicator} />
          <Ionicons name="person" size={16} color="white" />
          <Text style={[styles.navLabel, { color: "#0D9488" }]}>
            Trang cá nhân
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  projectTitleCard: {
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "center",
  },
  projectSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B1B1B1",
    marginBottom: 6,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
  },
  infoBoxesRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 6,
  },
  infoBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 7,
    fontWeight: "600",
    color: "#B1B1B1",
    marginBottom: 4,
    textAlign: "center",
  },
  infoValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "black",
  },
  progressCard: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.25)",
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "black",
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  progressCurrent: {
    fontSize: 10,
  },
  progressCurrentLabel: {
    color: "#B1B1B1",
    fontWeight: "600",
  },
  progressCurrentValue: {
    color: "black",
    fontWeight: "600",
  },
  progressCurrentName: {
    color: "black",
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0D9488",
    marginLeft: 8,
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#D9D9D9",
    borderRadius: 50,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0D9488",
    borderRadius: 50,
  },
  workflowContainer: {
    marginTop: 16,
    height: 440,
    position: "relative",
  },
  workflowBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#C4C4C4",
    pointerEvents: "none",
  },
  stepContainer: {
    position: "absolute",
    width: 65,
    alignItems: "center",
  },
  stepCircle: {
    width: 13,
    height: 13,
    borderRadius: 13,
    backgroundColor: "#ADADAD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  stepCircleCompleted: {
    backgroundColor: "#0D9488",
  },
  stepCircleCurrent: {
    backgroundColor: "#C4C4C4",
    borderWidth: 2,
    borderColor: "#0D9488",
  },
  stepNumber: {
    fontSize: 6,
    fontWeight: "700",
    color: "white",
  },
  stepNumberCompleted: {
    color: "white",
  },
  stepNumberCurrent: {
    color: "white",
  },
  stepLabel: {
    fontSize: 7,
    fontWeight: "500",
    color: "black",
    textAlign: "center",
    lineHeight: 9,
  },
  stepDetails: {
    position: "absolute",
    top: 20,
    left: -10,
    right: -10,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  stepDetailsText: {
    fontSize: 8,
    color: "#333",
    lineHeight: 11,
  },
  bottomNav: {
    flexDirection: "row",
    height: 48,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 8,
    fontWeight: "400",
    color: "black",
    marginTop: 2,
  },
  navActiveIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0D9488",
    position: "absolute",
    top: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
