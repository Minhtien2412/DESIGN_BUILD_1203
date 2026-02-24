/**
 * Project Quick Guide Card
 * Compact guide card for projects screen with quick access to help
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface QuickGuideCardProps {
  onPressGuide: () => void;
  onPressCreate: () => void;
}

export default function QuickGuideCard({ onPressGuide, onPressCreate }: QuickGuideCardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D9488', '#004499']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative circles */}
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorCircle, styles.decorCircle3]} />

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Ionicons name="bulb" size={28} color="#FCD34D" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Bắt đầu với Dự án</Text>
            <Text style={styles.subtitle}>
              Quản lý dự án xây dựng chuyên nghiệp: tiến độ, ngân sách, đội ngũ, tài liệu
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onPressCreate} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Tạo dự án</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={onPressGuide}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="book" size={18} color="#0D9488" />
              <Text style={[styles.actionButtonText, { color: '#0D9488' }]}>Hướng dẫn</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Tips Chips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipChip}>
            <Ionicons name="checkmark-circle" size={14} color="#0D9488" />
            <Text style={styles.tipChipText}>Theo dõi tiến độ</Text>
          </View>
          <View style={styles.tipChip}>
            <Ionicons name="wallet" size={14} color="#0D9488" />
            <Text style={styles.tipChipText}>Quản lý ngân sách</Text>
          </View>
          <View style={styles.tipChip}>
            <Ionicons name="people" size={14} color="#0D9488" />
            <Text style={styles.tipChipText}>Phân công team</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    padding: 20,
    position: 'relative',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle1: {
    width: 100,
    height: 100,
    top: -30,
    right: -20,
  },
  decorCircle2: {
    width: 60,
    height: 60,
    bottom: -10,
    left: -10,
  },
  decorCircle3: {
    width: 40,
    height: 40,
    top: 40,
    right: 60,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    position: 'relative',
    zIndex: 1,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    position: 'relative',
    zIndex: 1,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  tipsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 1,
  },
  tipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tipChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
});
