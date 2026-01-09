import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const contactMethods = [
  { id: 'phone', icon: 'call', title: 'Hotline', value: '1900-xxxx', color: '#4CAF50', action: 'tel:1900xxxx' },
  { id: 'email', icon: 'mail', title: 'Email', value: 'support@baotienweb.cloud', color: '#2196F3', action: 'mailto:support@baotienweb.cloud' },
  { id: 'zalo', icon: 'chatbubble-ellipses', title: 'Zalo', value: '0123 456 789', color: '#0068FF', action: 'https://zalo.me/0123456789' },
  { id: 'messenger', icon: 'logo-facebook', title: 'Messenger', value: 'AppDesignBuild', color: '#0084FF', action: 'https://m.me/AppDesignBuild' },
];

const offices = [
  {
    city: 'TP. Hồ Chí Minh',
    address: '123 Nguyễn Văn Linh, Quận 7',
    phone: '028 1234 5678',
    hours: '8:00 - 18:00',
  },
  {
    city: 'Hà Nội',
    address: '456 Cầu Giấy, Quận Cầu Giấy',
    phone: '024 1234 5678',
    hours: '8:00 - 18:00',
  },
];

export default function ContactScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleContact = (action: string) => {
    Linking.openURL(action).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở ứng dụng');
    });
  };

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    Alert.alert('Thành công', 'Tin nhắn của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất!');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Liên hệ', headerShown: true }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Contact */}
        <View style={styles.quickContact}>
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.contactMethod, { backgroundColor: cardBg }]}
              onPress={() => handleContact(method.action)}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                <Ionicons name={method.icon as any} size={24} color={method.color} />
              </View>
              <Text style={[styles.methodTitle, { color: textColor }]}>{method.title}</Text>
              <Text style={styles.methodValue}>{method.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Form */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Gửi tin nhắn</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Họ tên *</Text>
            <TextInput
              style={[styles.input, { backgroundColor, color: textColor }]}
              placeholder="Nhập họ tên"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Email *</Text>
            <TextInput
              style={[styles.input, { backgroundColor, color: textColor }]}
              placeholder="Nhập email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Chủ đề</Text>
            <TextInput
              style={[styles.input, { backgroundColor, color: textColor }]}
              placeholder="Chủ đề tin nhắn"
              placeholderTextColor="#999"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Nội dung *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor, color: textColor }]}
              placeholder="Nhập nội dung tin nhắn..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.submitBtnText}>Gửi tin nhắn</Text>
          </TouchableOpacity>
        </View>

        {/* Office Locations */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Văn phòng</Text>
          
          {offices.map((office, index) => (
            <View key={index} style={styles.officeItem}>
              <View style={styles.officeHeader}>
                <Ionicons name="location" size={20} color="#FF6B35" />
                <Text style={[styles.officeCity, { color: textColor }]}>{office.city}</Text>
              </View>
              <View style={styles.officeInfo}>
                <Text style={styles.officeText}>{office.address}</Text>
                <Text style={styles.officeText}>📞 {office.phone}</Text>
                <Text style={styles.officeText}>🕐 {office.hours}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Map placeholder */}
        <View style={[styles.mapContainer, { backgroundColor: cardBg }]}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color="#ccc" />
            <Text style={styles.mapText}>Xem bản đồ</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  quickContact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  contactMethod: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  methodValue: { fontSize: 12, color: '#666' },
  section: { margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: { height: 120, paddingTop: 12 },
  submitBtn: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  officeItem: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  officeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  officeCity: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  officeInfo: { marginLeft: 28 },
  officeText: { color: '#666', fontSize: 14, marginBottom: 4 },
  mapContainer: { margin: 16, marginTop: 0, borderRadius: 12, overflow: 'hidden' },
  mapPlaceholder: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mapText: { color: '#999', marginTop: 8 },
});
