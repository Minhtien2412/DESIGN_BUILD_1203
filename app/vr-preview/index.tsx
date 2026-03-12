import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const roomTypes = [
  { id: 'living', name: 'Phòng khách', icon: 'sofa' },
  { id: 'bedroom', name: 'Phòng ngủ', icon: 'bed' },
  { id: 'kitchen', name: 'Bếp', icon: 'restaurant' },
  { id: 'bathroom', name: 'Phòng tắm', icon: 'water' },
];

export default function VRPreviewScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState('living');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'VR Xem Phòng', headerShown: true }} />
      
      {/* VR Viewer Placeholder */}
      <View style={styles.vrViewer}>
        <View style={styles.vrPlaceholder}>
          <View style={styles.vrIconContainer}>
            <Ionicons name="glasses-outline" size={64} color="#14B8A6" />
          </View>
          <Text style={styles.vrTitle}>VR 360° Preview</Text>
          <Text style={styles.vrSubtitle}>Trải nghiệm phòng của bạn trong không gian 3D</Text>
          
          {/* Feature Coming Soon */}
          <View style={styles.comingSoonBadge}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.comingSoonText}>Tính năng đang phát triển</Text>
          </View>
        </View>

        {/* VR Controls Overlay */}
        <View style={styles.vrControls}>
          <TouchableOpacity style={styles.vrControlBtn}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.vrControlBtn}>
            <Ionicons name="remove" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.vrControlBtn, { backgroundColor: '#14B8A6' }]}>
            <Ionicons name="expand" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Room Selector */}
      <View style={[styles.roomSelector, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Chọn phòng</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {roomTypes.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={[
                styles.roomBtn,
                selectedRoom === room.id && styles.roomBtnActive,
              ]}
              onPress={() => setSelectedRoom(room.id)}
            >
              <Ionicons 
                name={
                  room.icon === 'sofa' ? 'bed-outline' :
                  room.icon === 'bed' ? 'bed-outline' :
                  room.icon === 'restaurant' ? 'restaurant-outline' :
                  'water-outline'
                } 
                size={24} 
                color={selectedRoom === room.id ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.roomBtnText,
                selectedRoom === room.id && styles.roomBtnTextActive,
              ]}>
                {room.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Features */}
      <ScrollView style={styles.featuresContainer}>
        <View style={[styles.featureCard, { backgroundColor: cardBg }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#14B8A615' }]}>
            <Ionicons name="walk-outline" size={28} color="#14B8A6" />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: textColor }]}>Di chuyển tự do</Text>
            <Text style={styles.featureDesc}>Đi bộ ảo trong phòng của bạn</Text>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: cardBg }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#4CAF5015' }]}>
            <Ionicons name="color-palette-outline" size={28} color="#4CAF50" />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: textColor }]}>Thay đổi vật liệu</Text>
            <Text style={styles.featureDesc}>Thử các loại gạch, sơn khác nhau</Text>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: cardBg }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#2196F315' }]}>
            <Ionicons name="sunny-outline" size={28} color="#2196F3" />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: textColor }]}>Ánh sáng thực tế</Text>
            <Text style={styles.featureDesc}>Xem phòng trong các điều kiện sáng khác nhau</Text>
          </View>
        </View>

        {/* Start VR CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.ctaBtn}>
            <Ionicons name="glasses-outline" size={24} color="#fff" />
            <Text style={styles.ctaBtnText}>Bắt đầu VR Tour</Text>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>Yêu cầu kính VR hoặc xoay điện thoại để trải nghiệm</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  vrViewer: {
    height: height * 0.35,
    backgroundColor: '#1a1a2e',
    position: 'relative',
  },
  vrPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  vrIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#14B8A620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  vrTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  vrSubtitle: { color: '#aaa', textAlign: 'center', marginTop: 8 },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
    gap: 8,
  },
  comingSoonText: { color: '#fff', fontWeight: '500' },
  vrControls: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -70 }],
    gap: 8,
  },
  vrControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomSelector: {
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  roomBtn: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
    minWidth: 80,
  },
  roomBtnActive: { backgroundColor: '#14B8A6' },
  roomBtnText: { color: '#666', fontSize: 12, marginTop: 6 },
  roomBtnTextActive: { color: '#fff' },
  featuresContainer: { flex: 1, padding: 16 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: { flex: 1, marginLeft: 16 },
  featureTitle: { fontSize: 15, fontWeight: '600' },
  featureDesc: { color: '#666', fontSize: 13, marginTop: 4 },
  ctaContainer: { alignItems: 'center', marginTop: 8, marginBottom: 32 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 10,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ctaNote: { color: '#999', fontSize: 12, marginTop: 12, textAlign: 'center' },
});
