import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Document {
  id: string;
  name: string;
  uri: string | null;
  uploaded: boolean;
}

export default function ContractorVerificationScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');

  const [companyName, setCompanyName] = useState('');
  const [representative, setRepresentative] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [email, setEmail] = useState('');

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Giấy phép kinh doanh',
      uri: null,
      uploaded: false,
    },
    {
      id: '2',
      name: 'Chứng chỉ năng lực',
      uri: null,
      uploaded: false,
    },
    {
      id: '3',
      name: 'Chứng chỉ thiết kế',
      uri: null,
      uploaded: false,
    },
    {
      id: '4',
      name: 'Chứng chỉ xây dựng',
      uri: null,
      uploaded: false,
    },
    {
      id: '5',
      name: 'Chứng chỉ an toàn lao động',
      uri: null,
      uploaded: false,
    },
  ]);

  const handlePickDocument = async (docId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setDocuments(prev =>
          prev.map(doc =>
            doc.id === docId
              ? { ...doc, uri: file.uri, uploaded: true }
              : doc
          )
        );
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Lỗi', 'Không thể chọn tài liệu');
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!companyName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên công ty');
      return;
    }
    if (!representative.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên người đại diện');
      return;
    }
    if (!taxCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã số thuế');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    const uploadedDocs = documents.filter(doc => doc.uploaded);
    if (uploadedDocs.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng tải lên ít nhất một chứng chỉ');
      return;
    }

    // TODO: API call to submit verification
    console.log('Submitting contractor verification:', {
      companyName,
      representative,
      taxCode,
      issueDate,
      email,
      documents: uploadedDocs,
    });

    Alert.alert('Thành công', 'Đã gửi yêu cầu xác minh tài khoản', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>
          Tài khoản xác minh
        </Text>

        {/* Company Info */}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Tên công ty</Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Nhập tên công ty"
              placeholderTextColor="#999"
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>
              Tên người đại diện
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#999"
              value={representative}
              onChangeText={setRepresentative}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Mã số thuế</Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Nhập mã số thuế"
              placeholderTextColor="#999"
              value={taxCode}
              onChangeText={setTaxCode}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Ngày cấp</Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Ngày/tháng/năm"
              placeholderTextColor="#999"
              value={issueDate}
              onChangeText={setIssueDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Upload Documents */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Upload chứng chỉ
          </Text>

          {documents.map(doc => (
            <View key={doc.id} style={styles.documentRow}>
              <View style={styles.documentInfo}>
                <Text style={[styles.documentName, { color: textColor }]}>
                  {doc.name}
                </Text>
                {doc.uploaded && (
                  <Text style={[styles.uploadedText, { color: '#4CAF50' }]}>
                    Tải lên.PDF
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  { backgroundColor: primaryColor },
                  doc.uploaded && styles.uploadedButton,
                ]}
                onPress={() => handlePickDocument(doc.id)}
              >
                <Text style={styles.uploadButtonText}>
                  {doc.uploaded ? 'Đã tải' : 'Tải lên'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: primaryColor }]}
        >
          <Text style={styles.submitButtonText}>Tạo tài khoản</Text>
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    marginBottom: 4,
  },
  uploadedText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  uploadButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  uploadedButton: {
    backgroundColor: '#4CAF50',
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
