/**
 * AI Architect - Export Center
 * Xuất bản thiết kế dưới nhiều định dạng
 */

import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ExportOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  format: string;
  color: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'pdf',
    icon: 'document-text',
    title: 'Báo Cáo PDF',
    description: 'Xuất báo cáo chi tiết với hình ảnh và thông số',
    format: 'PDF',
    color: '#ef4444',
  },
  {
    id: 'docx',
    icon: 'document',
    title: 'Tài Liệu Word',
    description: 'Xuất văn bản có thể chỉnh sửa',
    format: 'DOCX',
    color: '#0D9488',
  },
  {
    id: 'image',
    icon: 'image',
    title: 'Hình Ảnh Thiết Kế',
    description: 'Xuất hình render 3D, sơ đồ, phối cảnh',
    format: 'PNG/JPG',
    color: '#8b5cf6',
  },
  {
    id: 'code',
    icon: 'code-slash',
    title: 'Source Code',
    description: 'Xuất code PHP, SQL đã generate',
    format: 'ZIP',
    color: '#22c55e',
  },
  {
    id: 'cad',
    icon: 'cube',
    title: 'Bản Vẽ CAD',
    description: 'Xuất bản vẽ kỹ thuật AutoCAD',
    format: 'DWG/DXF',
    color: '#f59e0b',
  },
  {
    id: 'json',
    icon: 'server',
    title: 'Dữ Liệu JSON',
    description: 'Xuất dữ liệu dự án dạng API',
    format: 'JSON',
    color: '#06b6d4',
  },
];

interface RecentExport {
  id: string;
  name: string;
  format: string;
  date: string;
  size: string;
}

const RECENT_EXPORTS: RecentExport[] = [
  { id: '1', name: 'Villa_ModernDesign_v1', format: 'PDF', date: 'Hôm nay', size: '2.4 MB' },
  { id: '2', name: 'Resort_Tropical_Layout', format: 'PNG', date: 'Hôm qua', size: '890 KB' },
  { id: '3', name: 'Backend_Code_Package', format: 'ZIP', date: '2 ngày trước', size: '156 KB' },
];

export default function ExportScreen() {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (option: ExportOption) => {
    setExporting(option.id);

    // Simulate export process
    setTimeout(async () => {
      try {
        // Create sample content based on export type
        let content = '';
        let filename = '';
        let mimeType = '';

        switch (option.id) {
          case 'json':
            content = JSON.stringify(
              {
                project: 'AI Architect Export',
                timestamp: new Date().toISOString(),
                design: {
                  type: 'villa',
                  style: 'modern',
                  area: '300m²',
                  floors: 3,
                },
                features: ['pool', 'garden', 'smart_home'],
                exportedBy: 'AI Architect App',
              },
              null,
              2
            );
            filename = `ai_architect_export_${Date.now()}.json`;
            mimeType = 'application/json';
            break;

          case 'code':
            content = `<?php
/**
 * AI Architect - Generated Code
 * Project: Villa Modern Design
 * Generated: ${new Date().toLocaleDateString('vi-VN')}
 */

class VillaDesign {
    private $area = 300;
    private $floors = 3;
    private $style = 'modern';
    
    public function getSpecs(): array {
        return [
            'area' => $this->area,
            'floors' => $this->floors,
            'style' => $this->style,
            'features' => ['pool', 'garden', 'smart_home'],
        ];
    }
}
?>`;
            filename = `ai_architect_code_${Date.now()}.php`;
            mimeType = 'text/plain';
            break;

          default:
            content = `AI Architect Export
==================
Format: ${option.format}
Date: ${new Date().toLocaleDateString('vi-VN')}

This is a sample export from AI Architect.
In production, this would contain actual design data.`;
            filename = `ai_architect_${option.id}_${Date.now()}.txt`;
            mimeType = 'text/plain';
        }

        // Save to file system
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, content);

        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
          Alert.alert(
            '✅ Xuất Thành Công',
            `File ${filename} đã được tạo. Bạn muốn chia sẻ?`,
            [
              { text: 'Đóng', style: 'cancel' },
              {
                text: 'Copy',
                onPress: async () => {
                  await Clipboard.setStringAsync(content);
                  Alert.alert('Đã copy nội dung');
                },
              },
              {
                text: 'Chia sẻ',
                onPress: () => Sharing.shareAsync(fileUri, { mimeType }),
              },
            ]
          );
        } else {
          Alert.alert(
            '✅ Xuất Thành Công',
            `File: ${filename}\n\nĐã lưu vào thư mục ứng dụng.`
          );
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể xuất file. Vui lòng thử lại.');
      } finally {
        setExporting(null);
      }
    }, 1500);
  };

  return (
    <Container>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>📤 Export Center</Text>
            <Text style={styles.headerSubtitle}>
              Xuất thiết kế dưới nhiều định dạng
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: '#8e44ad' }]}
              onPress={() => router.push('/ai-architect/design' as never)}
            >
              <Ionicons name="color-palette" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Thiết Kế</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: '#14B8A6' }]}
              onPress={() => router.push('/ai-architect/templates' as never)}
            >
              <Ionicons name="layers" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Templates</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: '#22c55e' }]}
              onPress={() => router.push('/ai-architect/implementation' as never)}
            >
              <Ionicons name="code-slash" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📁 Định Dạng Xuất</Text>
          <View style={styles.exportGrid}>
            {EXPORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.exportCard}
                onPress={() => handleExport(option)}
                disabled={exporting !== null}
              >
                <View style={[styles.exportIcon, { backgroundColor: option.color }]}>
                  {exporting === option.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name={option.icon as any} size={24} color="#fff" />
                  )}
                </View>
                <Text style={styles.exportTitle}>{option.title}</Text>
                <Text style={styles.exportDesc}>{option.description}</Text>
                <View style={styles.formatBadge}>
                  <Text style={styles.formatText}>{option.format}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Exports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Xuất Gần Đây</Text>
          {RECENT_EXPORTS.map((item) => (
            <View key={item.id} style={styles.recentItem}>
              <View style={styles.recentIcon}>
                <Ionicons
                  name={
                    item.format === 'PDF'
                      ? 'document-text'
                      : item.format === 'PNG'
                      ? 'image'
                      : 'folder-open'
                  }
                  size={20}
                  color="#14B8A6"
                />
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{item.name}</Text>
                <Text style={styles.recentMeta}>
                  {item.format} • {item.size} • {item.date}
                </Text>
              </View>
              <TouchableOpacity style={styles.recentAction}>
                <Ionicons name="share-outline" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Storage Info */}
        <View style={styles.section}>
          <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <Ionicons name="cloud" size={24} color="#14B8A6" />
              <Text style={styles.storageTitle}>Dung Lượng Lưu Trữ</Text>
            </View>
            <View style={styles.storageBar}>
              <View style={[styles.storageUsed, { width: '35%' }]} />
            </View>
            <Text style={styles.storageText}>350 MB / 1 GB đã sử dụng</Text>
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
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  exportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exportCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  exportTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  exportDesc: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  formatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  formatText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  recentIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#334155',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  recentMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  recentAction: {
    padding: 8,
  },
  storageCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  storageTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  storageUsed: {
    height: '100%',
    backgroundColor: '#14B8A6',
    borderRadius: 4,
  },
  storageText: {
    color: '#64748b',
    fontSize: 12,
  },
});
