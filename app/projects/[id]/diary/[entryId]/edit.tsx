/**
 * Construction Diary - Create/Edit Entry
 * Form tạo/sửa nhật ký công trình
 */

import { PhotoGrid } from '@/components/construction';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { DiaryService } from '@/services/api/diary.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'windy';

const WEATHER_OPTIONS: Array<{ value: WeatherCondition; icon: keyof typeof Ionicons.glyphMap; label: string }> = [
  { value: 'sunny', icon: 'sunny', label: 'Nắng' },
  { value: 'cloudy', icon: 'cloudy', label: 'Mây' },
  { value: 'rainy', icon: 'rainy', label: 'Mưa' },
  { value: 'windy', icon: 'cloudy-night', label: 'Gió' },
];

export default function DiaryEditScreen() {
  const { id: projectId, entryId } = useLocalSearchParams<{ id: string; entryId?: string }>();
  const isEdit = !!entryId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [temperature, setTemperature] = useState('28');
  const [weatherNotes, setWeatherNotes] = useState('');
  
  const [laborers, setLaborers] = useState('40');
  const [engineers, setEngineers] = useState('3');
  const [contractors, setContractors] = useState('5');
  
  const [workDescription, setWorkDescription] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit) {
      loadEntry();
    }
  }, [entryId]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const entry = await DiaryService.getEntry(entryId!);
      
      if (entry) {
        setDate(entry.date);
        setWeather(entry.weather.condition);
        setTemperature(entry.weather.temperature?.toString() || '');
        setWeatherNotes(entry.weather.notes || '');
        setLaborers(entry.workforce.laborers.toString());
        setEngineers(entry.workforce.engineers.toString());
        setContractors(entry.workforce.contractors.toString());
        setWorkDescription(entry.workCompleted[0]?.description || '');
        setWorkLocation(entry.workCompleted[0]?.location || '');
        setNotes(entry.notes || '');
        setPhotos(entry.photos);
      }
    } catch (error) {
      console.error('Failed to load entry:', error);
      Alert.alert('Lỗi', 'Không thể tải nhật ký');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!workDescription.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng mô tả công việc đã hoàn thành');
      return;
    }

    try {
      setSaving(true);

      const data = {
        projectId,
        date,
        weather: {
          condition: weather,
          temperature: temperature ? parseInt(temperature) : undefined,
          notes: weatherNotes.trim() || undefined,
        },
        workforce: {
          laborers: parseInt(laborers) || 0,
          engineers: parseInt(engineers) || 0,
          contractors: parseInt(contractors) || 0,
          total: (parseInt(laborers) || 0) + (parseInt(engineers) || 0) + (parseInt(contractors) || 0),
        },
        workCompleted: [
          {
            description: workDescription.trim(),
            location: workLocation.trim() || undefined,
          },
        ],
        materials: [],
        equipment: [],
        incidents: [],
        photos,
        notes: notes.trim() || undefined,
        createdBy: 'current-user',
      };

      if (isEdit) {
        await DiaryService.updateEntry(entryId!, data);
        Alert.alert('Thành công', 'Đã cập nhật nhật ký', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await DiaryService.createEntry(data);
        Alert.alert('Thành công', 'Đã tạo nhật ký mới', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Lỗi', 'Không thể lưu nhật ký');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhoto = () => {
    // Mock adding photo
    const newPhoto = {
      id: `photo-${Date.now()}`,
      uri: `https://picsum.photos/400/300?random=${Date.now()}`,
      caption: 'Ảnh thi công',
    };
    setPhotos([...photos, newPhoto]);
  };

  if (loading) {
    return (
      <Container fullWidth>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </Container>
    );
  }

  return (
    <Container fullWidth>
      <StatusBar style="dark" />
      
      {/* Header */}
      <Section>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>{isEdit ? 'Sửa nhật ký' : 'Nhật ký mới'}</Text>
          <View style={{ width: 40 }} />
        </View>
      </Section>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date & Weather */}
        <Section>
          <Text style={styles.sectionTitle}>Ngày & Thời tiết</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ngày</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Thời tiết</Text>
            <View style={styles.weatherOptions}>
              {WEATHER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.weatherOption,
                    weather === option.value && styles.weatherOptionActive,
                  ]}
                  onPress={() => setWeather(option.value)}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={weather === option.value ? '#3b82f6' : '#9ca3af'}
                  />
                  <Text
                    style={[
                      styles.weatherLabel,
                      weather === option.value && styles.weatherLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Nhiệt độ (°C)</Text>
              <TextInput
                style={styles.input}
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="numeric"
                placeholder="28"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ghi chú thời tiết</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={weatherNotes}
              onChangeText={setWeatherNotes}
              placeholder="VD: Mưa nhẹ buổi chiều"
              multiline
              numberOfLines={2}
            />
          </View>
        </Section>

        {/* Workforce */}
        <Section>
          <Text style={styles.sectionTitle}>Nhân công</Text>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.thirdWidth]}>
              <Text style={styles.label}>Công nhân</Text>
              <TextInput
                style={styles.input}
                value={laborers}
                onChangeText={setLaborers}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={[styles.formGroup, styles.thirdWidth]}>
              <Text style={styles.label}>Kỹ sư</Text>
              <TextInput
                style={styles.input}
                value={engineers}
                onChangeText={setEngineers}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={[styles.formGroup, styles.thirdWidth]}>
              <Text style={styles.label}>Thầu phụ</Text>
              <TextInput
                style={styles.input}
                value={contractors}
                onChangeText={setContractors}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Tổng nhân công</Text>
            <Text style={styles.totalValue}>
              {(parseInt(laborers) || 0) + (parseInt(engineers) || 0) + (parseInt(contractors) || 0)} người
            </Text>
          </View>
        </Section>

        {/* Work Completed */}
        <Section>
          <Text style={styles.sectionTitle}>Công việc hoàn thành</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mô tả công việc *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={workDescription}
              onChangeText={setWorkDescription}
              placeholder="VD: Hoàn thành đổ bê tông tầng 3"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Vị trí</Text>
            <TextInput
              style={styles.input}
              value={workLocation}
              onChangeText={setWorkLocation}
              placeholder="VD: Khu A - Tầng 3"
            />
          </View>
        </Section>

        {/* Photos */}
        <Section>
          <Text style={styles.sectionTitle}>Hình ảnh</Text>
          <PhotoGrid
            photos={photos}
            onAddPress={handleAddPhoto}
            maxPhotos={10}
          />
        </Section>

        {/* Notes */}
        <Section>
          <Text style={styles.sectionTitle}>Ghi chú khác</Text>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ghi chú bổ sung..."
            multiline
            numberOfLines={4}
          />
        </Section>

        {/* Actions */}
        <Section>
          <Button
            title={isEdit ? 'Cập nhật' : 'Tạo nhật ký'}
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          />
          
          <Button
            title="Hủy"
            variant="outline"
            onPress={() => router.back()}
            style={{ marginTop: 12 }}
            disabled={saving}
          />
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },
  weatherOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  weatherOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  weatherOptionActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  weatherLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 6,
  },
  weatherLabelActive: {
    color: '#3b82f6',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
});
