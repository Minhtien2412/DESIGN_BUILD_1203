/**
 * Create Inspection Screen
 * Form to create new quality control inspection
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { qcApi } from '@/services/qcApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type InspectionType = 'initial' | 'progress' | 'final' | 'safety' | 'quality';

export default function CreateInspectionScreen() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<InspectionType>('quality');
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = '#0066CC';

  const inspectionTypes: { value: InspectionType; label: string; icon: string }[] = [
    { value: 'initial', label: 'Initial', icon: 'play-circle-outline' },
    { value: 'progress', label: 'Progress', icon: 'hourglass-outline' },
    { value: 'final', label: 'Final', icon: 'checkmark-circle-outline' },
    { value: 'safety', label: 'Safety', icon: 'shield-checkmark-outline' },
    { value: 'quality', label: 'Quality', icon: 'star-outline' },
  ];

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter inspection title');
      return;
    }

    if (!projectId.trim()) {
      Alert.alert('Error', 'Please enter project ID');
      return;
    }

    try {
      setLoading(true);

      const inspection = await qcApi.createInspection({
        projectId,
        title: title.trim(),
        description: description.trim(),
        type,
        location: location.trim(),
        scheduledDate: new Date(scheduledDate).toISOString(),
        status: 'scheduled',
      });

      Alert.alert('Success', 'Inspection created successfully', [
        {
          text: 'OK',
          onPress: () => router.replace(`/quality-assurance/inspections/${inspection.id}`),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          New Inspection
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Inspection Type */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>
            Inspection Type *
          </Text>
          <View style={styles.typesGrid}>
            {inspectionTypes.map((item) => (
              <Pressable
                key={item.value}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor:
                      type === item.value ? `${primaryColor}20` : cardColor,
                    borderColor: type === item.value ? primaryColor : '#E5E5E5',
                  },
                ]}
                onPress={() => setType(item.value)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={type === item.value ? primaryColor : textColor}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    {
                      color: type === item.value ? primaryColor : textColor,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Title *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: cardColor, color: textColor },
            ]}
            placeholder="Enter inspection title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Project ID */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Project ID *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: cardColor, color: textColor },
            ]}
            placeholder="Enter project ID"
            placeholderTextColor="#999"
            value={projectId}
            onChangeText={setProjectId}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Location</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: cardColor, color: textColor },
            ]}
            placeholder="Enter location (e.g., Building A, Floor 2)"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Scheduled Date */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>
            Scheduled Date *
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: cardColor, color: textColor },
            ]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            value={scheduledDate}
            onChangeText={setScheduledDate}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: cardColor, color: textColor },
            ]}
            placeholder="Enter inspection description"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Create Button */}
        <Pressable
          style={[
            styles.createButton,
            {
              backgroundColor: loading ? '#CCC' : primaryColor,
            },
          ]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Inspection</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
