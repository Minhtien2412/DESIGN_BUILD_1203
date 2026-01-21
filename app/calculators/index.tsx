/**
 * Calculators Index - Trang chính các tiện ích tính toán
 */
import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const CALCULATORS = [
  {
    id: 'paint',
    title: 'Tính lượng Sơn',
    emoji: '🎨',
    desc: 'Tính số lít sơn cần dùng theo diện tích tường',
    color: '#e74c3c',
    route: '/calculators/paint',
  },
  {
    id: 'tiles',
    title: 'Tính số Gạch',
    emoji: '🧱',
    desc: 'Tính số viên gạch lát nền, ốp tường',
    color: '#f39c12',
    route: '/calculators/tiles',
  },
  {
    id: 'electrical',
    title: 'Công suất Điện',
    emoji: '⚡',
    desc: 'Tính tổng công suất và chọn dây điện phù hợp',
    color: '#3498db',
    route: '/calculators/electrical',
  },
  {
    id: 'plumbing',
    title: 'Đường ống Nước',
    emoji: '💧',
    desc: 'Tính kích thước ống nước, lưu lượng',
    color: '#1abc9c',
    route: '/calculators/plumbing',
  },
];

export default function CalculatorsIndexScreen() {
  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>🧮 Tiện ích Tính toán</Text>
            <Text style={styles.headerSubtitle}>Công cụ hữu ích cho gia chủ</Text>
          </View>
        </View>

        {/* Calculator Cards */}
        <View style={styles.grid}>
          {CALCULATORS.map((calc) => (
            <TouchableOpacity
              key={calc.id}
              style={styles.card}
              onPress={() => router.push(calc.route as never)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: calc.color + '20' }]}>
                <Text style={styles.emoji}>{calc.emoji}</Text>
              </View>
              <Text style={styles.cardTitle}>{calc.title}</Text>
              <Text style={styles.cardDesc}>{calc.desc}</Text>
              <View style={[styles.arrow, { backgroundColor: calc.color }]}>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Mẹo hay</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>• Luôn thêm 10-15% dự phòng khi mua vật liệu</Text>
            <Text style={styles.tipText}>• Kiểm tra chất lượng vật liệu trước khi thi công</Text>
            <Text style={styles.tipText}>• Tham khảo ý kiến chuyên gia nếu cần</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  arrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsSection: {
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 22,
  },
});
