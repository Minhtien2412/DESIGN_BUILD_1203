import { MODERN_COLORS } from '@/constants/modern-theme';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;

interface WorkflowStep {
  id: string;
  phase: number;
  name: string;
  status: 'completed' | 'current' | 'pending';
  details?: string;
  shortDesc?: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: '1',
    phase: 1,
    name: 'Khởi công dự án',
    status: 'completed',
  },
  {
    id: '2',
    phase: 1,
    name: 'Thi công ép cọc',
    status: 'completed',
    details: 'Kiểm tra cote gửi, ép cọc thử theo chỉ định thiết kế\nTổ hợp các đoạn cọc và tiến hành ép cọc',
  },
  {
    id: '3',
    phase: 1,
    name: 'Thi công móng hầm',
    status: 'completed',
    details: 'CÔNG TÁC CỌC\nCÔNG TÁC BÊ TÔNG LÓT\nCÔNG TÁC XÂY COFFA GẠCH\nCÔNG TÁC CỐT THÉP MÓNG - GIẰNG MÓNG - ĐÀ KIỀNG\nCÔNG TÁC NỀN\nCÔNG TÁC CỐT THÉP SÀN',
  },
  {
    id: '4',
    phase: 1,
    name: 'Thi công móng(không hầm)',
    status: 'completed',
    details: 'CÔNG TÁC ĐÀO ĐẤT VÀ ÉP (ĐÓNG) CỪ\nCÔNG TÁC CỌC VÀ BÊ TÔNG LÓT\nCÔNG TÁC XÂY COFFA GẠCH\nCÔNG TÁC CỐT THÉP MÓNG - VÀ ĐÀ KIỀNG GIẰNG\nCÔNG TÁC NỀN\nCÔNG TÁC CỐT THÉP SÀN VÁCH',
  },
  {
    id: '5',
    phase: 2,
    name: 'Công tác cột bê tông',
    status: 'current',
    details: 'Thi công dựng cột, mực chân cột.\nChân cột: tạo nhám, vệ sinh.\nThi công cốt thép: chủng loại, số lượng, đường kính, khoảng cách,..\nThép râu cột: số lượng, vị trí, khoảng cách, chiều dài.\nCao độ thép chờ: dầm thang, đà lanh tô.\nThi đóng coffa: kích thước, độ kín khít bề mặt, sơ bộ về độ thẳng đứng theo 2 phương, hệ giằng chống.\nKiểm tra vị trí tiếp giáp với các công trình lân cận.',
  },
  {
    id: '6',
    phase: 2,
    name: 'Thi công dầm sàn',
    status: 'pending',
    details: 'Gửi cote trên các cột để kiểm tra\nThi công cao độ đáy dầm, sàn\nThi công thước dầm: bề rộng, chiều cao dầm.\nThi công hệ thống đỡ dầm, sàn\nThi công kích thước các ô thông tầng, ô cầu thang.\nKiểm tra độ kín khít của coffa\nTạo nhám và Vệ sinh cốt thép chờ đầu cột',
  },
  {
    id: '7',
    phase: 2,
    name: 'Công tác đổ bê tông',
    status: 'pending',
    details: 'Đối với bê tông thương phẩm: kiểm tra thời gian vận chuyển và đổ bê tông, niêm chì, mác bê tông, phụ gia, độ sụt, lấy mẫu. Đối với bê tông thủ công kiểm tra cấp phối bê tông.\nCông tác đầm bê tông (tránh bê tông phân tầng).\nVị trí mạch ngừng bê tông nếu gặp sự cố\nTrong quá trình đổ bê tông phải thường xuyên kiểm tra hệ chống đỡ đà giáo coppha.\nVệ sinh khu vực thi công.',
  },
  {
    id: '8',
    phase: 3,
    name: 'Công tác xây tường',
    status: 'pending',
    details: 'Tưới ẩm mặt cột, mặt sàn.\nTrét hồ dầu liên kết giữa vữa với mặt sàn, vữa với mặt cột\nVị trí chân tường toilet, ban công, sân, sân thượng, mái, phòng giặt thì xây 5 lớp gạch đinh; các vị trí còn lại xây 2 lớp gạch đinh.\nTường ≥200: xây 5 lớp gạch ống thì cuốn 1 lớp gạch đinh quay ngang.\nChiều dài thép và bê tông neo vào tường của đà lanh tô phải đảm bảo ≥200; nếu trường hợp <200 thì phải thống nhất biện pháp trước khi thi công',
  },
  {
    id: '9',
    phase: 3,
    name: 'Công tác trát tường',
    status: 'pending',
    details: 'Trám hồ dầu các vị trí có bê tông, vị trí đóng lưới chống nứt.\nĐối với những mảng tường dày lớp trát >2cm trát thành 2 lần.\nSau khi hoàn thiện tường trát phải kiểm tra lại bằng thước.\nVị trí mạch ngừng phải cắt vát 45°\nTháo ghém, hoàn thiện vị trí tháo ghém.\nLắp đặt đế âm ME phải phẳng và bằng mặt tường trát.\nVệ sinh tường, khu vực thi công.\nTưới bảo dưỡng sau trát 12h; 2 lần/ngày; liên tục trong 2 ngày.',
  },
  {
    id: '10',
    phase: 3,
    name: 'Thi công sơn nước',
    status: 'pending',
    details: 'Kiểm tra bề mặt tường thi công\nKiểm tra bề mặt trần thạch cao\nVệ sinh bề mặt\nKiểm tra tủ lệ pha trộn theo nhà sản xuất\nTiến hành bả matit lớp 1 sau khi trát tường tối thiểu từ 5 - 7 ngày trong điều kiện thời tiết khô ráo.',
  },
  {
    id: '11',
    phase: 4,
    name: 'Thi công ốp gạch',
    status: 'pending',
    details: 'Vệ sinh, tưới ẩm tường\nKiểm tra độ ẩm của gạch\nDùng hồ dầu, keo chuyên dụng\nDùng khoen để khoét các vị trí ống chờ\nVệ sinh bề mặt, đường ron sau khi ốp (tháo ke ron)',
  },
  {
    id: '12',
    phase: 4,
    name: 'Thi công lát gạch',
    status: 'pending',
    details: 'Vệ sinh, tưới ẩm nền\nKiểm tra độ ẩm của gạch (gạch men)\nDùng hồ dầu liên kết\nVệ sinh bề mặt, đường ron sau khi lát',
  },
  {
    id: '13',
    phase: 4,
    name: 'Thi công trần thạch cao',
    status: 'pending',
    details: 'Bắn mực lắp V nhôm theo đúng cao độ trên tường\nKhoan bắt ty theo hệ khung, khoảng cách các ty treo\nLắp ty, hệ khung xương khoảng cách treo quy cách nhà sản xuất\nGia cố vị trí khung xương có đèn âm trần đi qua\nKiểm tra độ phẳng của hệ khung xương trước khi lắp tấm thạch cao.\nLắp tấm thạch cao\nXử lý mối nối giữa 2 tấm: đóng lưới và dán băng keo chuyên dụng',
  },
  {
    id: '14',
    phase: 5,
    name: 'Thi công điện nước',
    status: 'pending',
    details: 'Thi công điện nước theo bản vẽ\nThi công các đầu bít vị trí ống chờ\nThi công vị trí van xả khí\nLưu ý: Dùng các đầu bít chuyên dụng',
  },
  {
    id: '15',
    phase: 5,
    name: 'Thi công khung bao',
    status: 'pending',
    details: 'Lắp khuôn bao kết hợp với công tác xây tường\nVị trí, kích thước, cao độ, độ thẳng đứng.\nĐổ bê tông hoặc trám vữa Mác cao vị trí bát liên kết giữa khuôn bao và tường xây.\nKiểm tra lại sau khi xây tường.\nTháo kê, nêm định vị sau khi tường xây đạt cường độ ( 3 - 4 ngày).',
  },
  {
    id: '16',
    phase: 5,
    name: 'Lắp khuôn bao,cánh cửa',
    status: 'pending',
    details: 'Lắp khuôn bao: vị trí, kích thước, cao độ, thẳng đứng\nKhoan bắt vít chuyên dụng, xử lý vị trí bắt vít.\nKiểm tra lại, tháo kê nêm.',
  },
  {
    id: '17',
    phase: 6,
    name: 'Thi công lan can',
    status: 'pending',
    details: 'Lắp khuôn bao: vị trí, kích thước, cao độ, thẳng đứng\nKhoan bắt vít chuyên dụng, xử lý vị trí bắt vít.\nKiểm tra lại, tháo kê nêm.',
  },
  {
    id: '18',
    phase: 6,
    name: 'Lắp đặt nội thất',
    status: 'pending',
    details: 'Kiểm tra vị trí, kích thước của sản phẩm và lỗ chờ MEP\nBề mặt gỗ phải phẳng, vân gỗ phải đồng nhất về chất liệu và thẩm mỹ.\nBề mặt ngoài: sơn không bụi, đồng đều về màu sắc\nBề mặt trong: sơn đồng đều về màu sắc\nKiểm tra độ kín khít vị trí tiếpgiáp\nKiểm tra thiết bị, phụ kiện hoạt động tốt\nCác vít lộ phải lắp che phủ.',
  },
  {
    id: '19',
    phase: 7,
    name: 'Vệ sinh công nghiệp',
    status: 'pending',
  },
  {
    id: '20',
    phase: 7,
    name: 'Bàn giao nhà',
    status: 'pending',
  },
];

export default function ProgressDetailScreen() {
  const insets = useSafeAreaInsets();
  const [expandedStep, setExpandedStep] = useState<string | null>('5');

  const currentProgress = 20; // 20%

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TIẾN ĐỘ CÔNG TRÌNH</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Info Card */}
        <View style={styles.projectCard}>
          <Text style={styles.projectName}>Biệt Thự Tân Cổ Điển KingCrown</Text>
          
          <View style={styles.infoRow}>
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
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Tiến độ</Text>
          <View style={styles.currentStatus}>
            <Text style={styles.currentStatusLabel}>Hiện tại: </Text>
            <Text style={styles.currentStatusPhase}>04 </Text>
            <Text style={styles.currentStatusName}>Công tác cột bê tông</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${currentProgress}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{currentProgress}%</Text>
          </View>
        </View>

        {/* Workflow Map */}
        <View style={styles.workflowContainer}>
          {WORKFLOW_STEPS.map((step, index) => {
            const isExpanded = expandedStep === step.id;
            const nextStep = WORKFLOW_STEPS[index + 1];
            const showConnector = nextStep !== null;
            
            // Calculate position for zigzag pattern
            const row = Math.floor(index / 4);
            const col = index % 4;
            const isReversed = row % 2 === 1;
            const position = isReversed ? 3 - col : col;

            return (
              <View key={step.id}>
                <View style={[styles.stepRow, { marginLeft: position * 68 }]}>
                  <TouchableOpacity
                    style={styles.stepButton}
                    onPress={() => setExpandedStep(isExpanded ? null : step.id)}
                  >
                    <View
                      style={[
                        styles.stepCircle,
                        step.status === 'completed' && styles.stepCircleCompleted,
                        step.status === 'current' && styles.stepCircleCurrent,
                      ]}
                    >
                      <Text style={styles.stepNumber}>{step.phase.toString().padStart(2, '0')}</Text>
                    </View>
                    <Text style={styles.stepName}>{step.name}</Text>
                    
                    {step.details && (
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color={MODERN_COLORS.gray600}
                        style={styles.expandIcon}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Expanded Details */}
                {isExpanded && step.details && (
                  <View style={[styles.detailsBox, { marginLeft: position * 68 }]}>
                    <Text style={styles.detailsText}>{step.details}</Text>
                  </View>
                )}

                {/* Connector Line */}
                {showConnector && (
                  <View
                    style={[
                      styles.connector,
                      {
                        left: position * 68 + 6,
                        width: col === 3 ? 20 : 68,
                        borderColor:
                          step.status === 'completed'
                            ? MODERN_COLORS.success
                            : MODERN_COLORS.gray300,
                      },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.gray50,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MODERN_COLORS.gray500,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  projectCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MODERN_COLORS.gray300,
    padding: 16,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: MODERN_COLORS.gray900,
    textAlign: 'center',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoBox: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: MODERN_COLORS.gray300,
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 7,
    fontWeight: '600',
    color: MODERN_COLORS.gray500,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: '600',
    color: MODERN_COLORS.gray900,
  },
  progressCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MODERN_COLORS.gray300,
    padding: 16,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: MODERN_COLORS.gray900,
    marginBottom: 8,
  },
  currentStatus: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  currentStatusLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: MODERN_COLORS.gray500,
  },
  currentStatusPhase: {
    fontSize: 10,
    fontWeight: '600',
    color: MODERN_COLORS.gray900,
  },
  currentStatusName: {
    fontSize: 10,
    fontWeight: '500',
    color: MODERN_COLORS.gray900,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: MODERN_COLORS.gray200,
    borderRadius: 50,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: MODERN_COLORS.success,
    borderRadius: 50,
  },
  progressPercent: {
    fontSize: 10,
    fontWeight: '700',
    color: MODERN_COLORS.success,
  },
  workflowContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    position: 'relative',
    paddingBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepButton: {
    alignItems: 'center',
    width: 80,
  },
  stepCircle: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: MODERN_COLORS.gray400,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleCompleted: {
    backgroundColor: MODERN_COLORS.success,
  },
  stepCircleCurrent: {
    backgroundColor: MODERN_COLORS.gray400,
    borderWidth: 2,
    borderColor: MODERN_COLORS.success,
  },
  stepNumber: {
    fontSize: 6,
    fontWeight: '700',
    color: 'white',
  },
  stepName: {
    fontSize: 7,
    fontWeight: '500',
    color: MODERN_COLORS.gray900,
    textAlign: 'center',
    lineHeight: 9,
  },
  expandIcon: {
    marginTop: 4,
  },
  detailsBox: {
    backgroundColor: MODERN_COLORS.orange50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MODERN_COLORS.gray300,
    padding: 10,
    marginBottom: 12,
    width: width - 80,
    maxWidth: 280,
  },
  detailsText: {
    fontSize: 8,
    fontWeight: '300',
    color: MODERN_COLORS.gray900,
    lineHeight: 11,
  },
  connector: {
    position: 'absolute',
    height: 2,
    top: 6,
    borderTopWidth: 1,
    borderStyle: 'solid',
  },
});
