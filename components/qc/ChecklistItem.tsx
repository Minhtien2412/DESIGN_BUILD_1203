import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export type InspectionResult = 'PASS' | 'FAIL' | 'NA';

export interface ChecklistItemData {
  id: string;
  title: string;
  description?: string;
  result: InspectionResult | null;
  notes: string;
  photos: string[];
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  index: number;
  onChange: (id: string, updates: Partial<ChecklistItemData>) => void;
  required?: boolean;
}

const RESULT_OPTIONS: { value: InspectionResult; label: string; color: string; icon: string }[] = [
  { value: 'PASS', label: 'Đạt', color: '#4CAF50', icon: 'checkmark-circle' },
  { value: 'FAIL', label: 'Không đạt', color: '#1A1A1A', icon: 'close-circle' },
  { value: 'NA', label: 'N/A', color: '#9E9E9E', icon: 'remove-circle' },
];

export default function ChecklistItem({
  item,
  index,
  onChange,
  required = false,
}: ChecklistItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  const handleResultChange = (result: InspectionResult) => {
    onChange(item.id, { result });
  };

  const handleNotesChange = (notes: string) => {
    onChange(item.id, { notes });
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Thêm ảnh',
      'Tính năng upload ảnh sẽ được triển khai trong Task #44',
      [{ text: 'OK' }]
    );
  };

  const handleRemovePhoto = (photoIndex: number) => {
    const newPhotos = item.photos.filter((_, i) => i !== photoIndex);
    onChange(item.id, { photos: newPhotos });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.index}>{index + 1}.</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {item.title}
              {required && <Text style={styles.required}> *</Text>}
            </Text>
            {item.description && <Text style={styles.description}>{item.description}</Text>}
          </View>
        </View>
      </View>

      {/* Result Options */}
      <View style={styles.resultRow}>
        {RESULT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.resultButton,
              item.result === option.value && {
                backgroundColor: option.color,
                borderColor: option.color,
              },
            ]}
            onPress={() => handleResultChange(option.value)}
          >
            <Ionicons
              name={option.icon as any}
              size={20}
              color={item.result === option.value ? '#fff' : option.color}
            />
            <Text
              style={[
                styles.resultLabel,
                item.result === option.value && styles.resultLabelActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowNotes(!showNotes)}
        >
          <Ionicons name="chatbox-outline" size={18} color="#666" />
          <Text style={styles.actionText}>Ghi chú</Text>
          {item.notes && <View style={styles.actionBadge} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowPhotos(!showPhotos)}
        >
          <Ionicons name="camera-outline" size={18} color="#666" />
          <Text style={styles.actionText}>Ảnh ({item.photos.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Notes Input */}
      {showNotes && (
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            placeholder="Nhập ghi chú..."
            value={item.notes}
            onChangeText={handleNotesChange}
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      {/* Photos */}
      {showPhotos && (
        <View style={styles.photosContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {item.photos.map((photo, photoIndex) => (
              <View key={photoIndex} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.photoRemove}
                  onPress={() => handleRemovePhoto(photoIndex)}
                >
                  <Ionicons name="close-circle" size={24} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.photoAdd} onPress={handleAddPhoto}>
              <Ionicons name="add" size={32} color="#999" />
              <Text style={styles.photoAddText}>Thêm ảnh</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  index: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    lineHeight: 20,
  },
  required: {
    color: '#1A1A1A',
  },
  description: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    lineHeight: 18,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  resultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  resultLabelActive: {
    color: '#fff',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  actionText: {
    fontSize: 13,
    color: '#666',
  },
  actionBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A6847',
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photosContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  photoItem: {
    position: 'relative',
    marginRight: 12,
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  photoRemove: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  photoAdd: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  photoAddText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});
