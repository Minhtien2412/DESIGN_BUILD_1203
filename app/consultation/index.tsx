import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const consultationTypes = [
  { id: '1', name: 'Thiết kế nội thất', icon: 'color-palette-outline', price: 'Miễn phí' },
  { id: '2', name: 'Thi công xây dựng', icon: 'construct-outline', price: '200.000đ' },
  { id: '3', name: 'Chọn vật liệu', icon: 'cube-outline', price: 'Miễn phí' },
  { id: '4', name: 'Phong thủy', icon: 'compass-outline', price: '500.000đ' },
  { id: '5', name: 'Ngân sách dự án', icon: 'calculator-outline', price: 'Miễn phí' },
  { id: '6', name: 'Pháp lý xây dựng', icon: 'document-text-outline', price: '300.000đ' },
];

const experts = [
  {
    id: '1',
    name: 'KTS. Nguyễn Văn An',
    specialty: 'Thiết kế nội thất',
    avatar: 'https://ui-avatars.com/api/?name=An&background=FF6B35&color=fff',
    rating: 4.9,
    consultations: 234,
    available: true,
    responseTime: '< 1 giờ',
  },
  {
    id: '2',
    name: 'KS. Trần Minh Phong',
    specialty: 'Kỹ sư xây dựng',
    avatar: 'https://ui-avatars.com/api/?name=Phong&background=4CAF50&color=fff',
    rating: 4.8,
    consultations: 189,
    available: true,
    responseTime: '< 2 giờ',
  },
  {
    id: '3',
    name: 'Thầy Lê Hoàng',
    specialty: 'Phong thủy',
    avatar: 'https://ui-avatars.com/api/?name=Hoang&background=9C27B0&color=fff',
    rating: 4.9,
    consultations: 567,
    available: false,
    responseTime: '< 3 giờ',
  },
];

const recentQuestions = [
  { id: '1', question: 'Nên chọn gạch ceramic hay granite?', answers: 12, time: '2 giờ trước' },
  { id: '2', question: 'Chi phí xây nhà 3 tầng 100m2?', answers: 8, time: '5 giờ trước' },
  { id: '3', question: 'Hướng nhà Tây Nam có tốt không?', answers: 15, time: '1 ngày trước' },
];

export default function ConsultationScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [question, setQuestion] = useState('');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Tư vấn', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ask Question */}
        <View style={[styles.askSection, { backgroundColor: '#FF6B35' }]}>
          <Text style={styles.askTitle}>Bạn cần tư vấn gì?</Text>
          <View style={styles.askInputContainer}>
            <TextInput
              style={styles.askInput}
              placeholder="Nhập câu hỏi của bạn..."
              placeholderTextColor="#999"
              value={question}
              onChangeText={setQuestion}
            />
            <TouchableOpacity style={styles.askBtn}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Consultation Types */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Chủ đề tư vấn</Text>
          <View style={styles.typesGrid}>
            {consultationTypes.map((type) => (
              <TouchableOpacity key={type.id} style={styles.typeItem}>
                <View style={[styles.typeIcon, { backgroundColor: '#FF6B3515' }]}>
                  <Ionicons name={type.icon as any} size={24} color="#FF6B35" />
                </View>
                <Text style={[styles.typeName, { color: textColor }]}>{type.name}</Text>
                <Text style={[
                  styles.typePrice,
                  type.price === 'Miễn phí' && { color: '#4CAF50' }
                ]}>
                  {type.price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Online Experts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Chuyên gia trực tuyến</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {experts.map((expert) => (
              <TouchableOpacity key={expert.id} style={[styles.expertCard, { backgroundColor: cardBg }]}>
                <View style={styles.expertAvatarContainer}>
                  <Image source={{ uri: expert.avatar }} style={styles.expertAvatar} />
                  <View style={[
                    styles.availabilityDot,
                    { backgroundColor: expert.available ? '#4CAF50' : '#999' }
                  ]} />
                </View>
                <Text style={[styles.expertName, { color: textColor }]}>{expert.name}</Text>
                <Text style={styles.expertSpecialty}>{expert.specialty}</Text>
                <View style={styles.expertStats}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={styles.expertRating}>{expert.rating}</Text>
                  <Text style={styles.expertConsults}>• {expert.consultations} tư vấn</Text>
                </View>
                <Text style={styles.responseTime}>⏱️ {expert.responseTime}</Text>
                <TouchableOpacity 
                  style={[
                    styles.chatBtn,
                    !expert.available && styles.chatBtnDisabled
                  ]}
                >
                  <Text style={styles.chatBtnText}>
                    {expert.available ? 'Chat ngay' : 'Để lại tin nhắn'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Questions */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Câu hỏi phổ biến</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {recentQuestions.map((q) => (
            <TouchableOpacity key={q.id} style={styles.questionItem}>
              <View style={styles.questionIcon}>
                <Ionicons name="help-circle" size={24} color="#FF6B35" />
              </View>
              <View style={styles.questionContent}>
                <Text style={[styles.questionText, { color: textColor }]}>{q.question}</Text>
                <View style={styles.questionMeta}>
                  <Ionicons name="chatbubbles-outline" size={12} color="#666" />
                  <Text style={styles.questionMetaText}>{q.answers} trả lời</Text>
                  <Text style={styles.questionTime}>• {q.time}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Assistant */}
        <TouchableOpacity style={[styles.aiCard, { backgroundColor: '#4CAF50' }]}>
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
  container: { flex: 1 },
  askSection: { padding: 20, paddingTop: 16 },
  askTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  askInputContainer: { flexDirection: 'row', alignItems: 'center' },
  askInput: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  askBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  section: { margin: 16, marginBottom: 0, padding: 16, borderRadius: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  viewAll: { color: '#FF6B35', fontSize: 14 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  typeItem: { width: '31%', alignItems: 'center', marginBottom: 16 },
  typeIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  typeName: { fontSize: 12, textAlign: 'center', marginBottom: 4 },
  typePrice: { fontSize: 11, color: '#FF6B35', fontWeight: '500' },
  expertCard: { width: 160, padding: 16, borderRadius: 12, marginRight: 12, alignItems: 'center' },
  expertAvatarContainer: { position: 'relative' },
  expertAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0' },
  availabilityDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  expertName: { fontSize: 13, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  expertSpecialty: { color: '#666', fontSize: 11, marginTop: 2 },
  expertStats: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  expertRating: { fontSize: 12, fontWeight: '500', marginLeft: 2 },
  expertConsults: { color: '#666', fontSize: 11, marginLeft: 4 },
  responseTime: { fontSize: 10, color: '#666', marginTop: 4 },
  chatBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 10,
  },
  chatBtnDisabled: { backgroundColor: '#999' },
  chatBtnText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  questionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  questionIcon: { marginRight: 12 },
  questionContent: { flex: 1 },
  questionText: { fontSize: 14, lineHeight: 20 },
  questionMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  questionMetaText: { color: '#666', fontSize: 11, marginLeft: 4 },
  questionTime: { color: '#999', fontSize: 11, marginLeft: 4 },
  aiCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiContent: { flex: 1, marginLeft: 16 },
  aiTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  aiDesc: { color: '#fff', opacity: 0.9, marginTop: 2 },
});
