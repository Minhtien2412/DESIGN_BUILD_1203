/**
 * Document Card Component
 * Card hiển thị tài liệu/file
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface DocumentCardProps {
  name: string;
  type: string; // pdf, doc, xls, image, etc
  size?: string;
  date?: string;
  onPress?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

const FILE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  pdf: 'document-text',
  doc: 'document',
  docx: 'document',
  xls: 'grid',
  xlsx: 'grid',
  ppt: 'easel',
  pptx: 'easel',
  image: 'image',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  zip: 'folder',
  rar: 'folder',
};

const FILE_COLORS: Record<string, string> = {
  pdf: '#000000',
  doc: '#3b82f6',
  docx: '#3b82f6',
  xls: '#0066CC',
  xlsx: '#0066CC',
  ppt: '#0066CC',
  pptx: '#0066CC',
  image: '#666666',
  jpg: '#666666',
  jpeg: '#666666',
  png: '#666666',
  zip: '#6b7280',
  rar: '#6b7280',
};

export default function DocumentCard({
  name,
  type,
  size,
  date,
  onPress,
  onDownload,
  onDelete,
  style,
}: DocumentCardProps) {
  const icon = FILE_ICONS[type.toLowerCase()] || 'document';
  const color = FILE_COLORS[type.toLowerCase()] || '#6b7280';

  const Content = onPress ? TouchableOpacity : View;

  return (
    <Content
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.type}>{type.toUpperCase()}</Text>
          {size && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.size}>{size}</Text>
            </>
          )}
          {date && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.date}>{date}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {onDownload && (
          <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
            <Ionicons name="download-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color="#000000" />
          </TouchableOpacity>
        )}
      </View>
    </Content>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
  },
  separator: {
    fontSize: 11,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  size: {
    fontSize: 11,
    color: '#9ca3af',
  },
  date: {
    fontSize: 11,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
